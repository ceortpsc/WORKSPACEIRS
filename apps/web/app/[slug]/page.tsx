import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getRoute,platformRoutes} from '../../lib/routes';

export function generateStaticParams(){return platformRoutes.map(route=>({slug:route.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const route=getRoute(slug);return route?{title:route.title,description:route.description,robots:route.access==='public'?{index:true,follow:true}:{index:false,follow:false}}:{};}

export default async function RoutedPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const route=getRoute(slug);if(!route)notFound();
 return <section className="section"><div className="container"><span className="status">{route.access} route</span><div className="eyebrow">WORKSPACEIRS</div><h1 style={{fontFamily:'Georgia,serif',color:'var(--ross-navy-900)',fontSize:'clamp(2.5rem,6vw,4.5rem)',lineHeight:1.05}}>{route.title}</h1><p className="lead">{route.subtitle}</p><article className="feature" style={{marginTop:'2rem'}}><p>{route.description}</p><div className="actions"><Link className="ross-btn ross-btn-primary" href={route.ctaHref}>{route.cta}</Link><Link className="ross-btn ross-btn-secondary" href="/">Return Home</Link></div></article></div></section>;
}
