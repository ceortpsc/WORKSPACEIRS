import type {MetadataRoute} from 'next';
import {platformRoutes} from '../lib/routes';

const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl=(configuredSiteUrl?.startsWith('http')?configuredSiteUrl:'https://www.rosstaxsoftware.com').replace(/\/$/,'');

export default function sitemap():MetadataRoute.Sitemap{
 const now=new Date();
 const publicRoutes=platformRoutes.filter(route=>route.access==='public');
 return [
  {url:siteUrl,lastModified:now,changeFrequency:'weekly',priority:1},
  ...publicRoutes.map(route=>({url:`${siteUrl}/${route.slug}`,lastModified:now,changeFrequency:'monthly' as const,priority:route.slug==='services'?0.9:0.7}))
 ];
}
