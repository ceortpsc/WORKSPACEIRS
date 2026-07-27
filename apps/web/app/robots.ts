import type {MetadataRoute} from 'next';

const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl=configuredSiteUrl?.startsWith('http')?configuredSiteUrl:'https://www.rosstaxsoftware.com';
const deployEnvironment=(process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??'development').toLowerCase();
const indexable=['production','main'].includes(deployEnvironment);

export default function robots():MetadataRoute.Robots{
 if(!indexable)return {rules:{userAgent:'*',disallow:'/'} };
 return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/ero','/portal','/transcripts','/refunds','/notices','/payroll','/api/']}],sitemap:`${siteUrl}/sitemap.xml`,host:siteUrl};
}
