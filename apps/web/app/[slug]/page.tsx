import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import EnterpriseRouteRenderer from '../../components/enterprise-route-renderer';
import {getRoute,platformRoutes} from '../../lib/routes';

export function generateStaticParams(){return platformRoutes.map(route=>({slug:route.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const route=getRoute(slug);
 return route?{title:route.title,description:route.description,robots:route.access==='public'?undefined:{index:false,follow:false,noarchive:true}}:{};
}

export default async function RoutedPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const route=getRoute(slug);if(!route)notFound();
 return <EnterpriseRouteRenderer route={route}/>;
}
