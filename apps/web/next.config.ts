import type {NextConfig} from 'next';

const permanent=(source:string,destination:string)=>({source,destination,permanent:true});

const nextConfig:NextConfig={
 reactStrictMode:true,
 poweredByHeader:false,
 compress:true,
 trailingSlash:false,
 async redirects(){
  return [
   permanent('/index.html','/'),permanent('/home','/'),
   permanent('/command-center','/operations-fabric'),permanent('/command-center.html','/operations-fabric'),
   permanent('/ero','/operations-fabric'),permanent('/portal','/client-portal'),
   permanent('/transcripts','/tds-caf-vault'),permanent('/refunds','/refund-intelligence'),
   permanent('/masterfile-reconcile','/masterfile-reconciliation'),permanent('/practitioner-portal','/practitioner-work-zone'),
   permanent('/foundation.html','/foundation'),permanent('/efile-workbench.html','/efile-workbench'),
   permanent('/tds-caf.html','/tds-caf-vault'),permanent('/refund-intelligence.html','/refund-intelligence'),
   permanent('/masterfile-reconcile.html','/masterfile-reconciliation'),permanent('/ai-workforce.html','/ai-workforce'),
   permanent('/service-hub.html','/service-hub'),permanent('/client-portal.html','/client-portal'),
   permanent('/practitioner-portal.html','/practitioner-work-zone'),permanent('/analytics.html','/analytics'),
   permanent('/compliance.html','/compliance'),permanent('/infrastructure.html','/infrastructure'),
   permanent('/apple-release.html','/apple-release'),permanent('/documentation.html','/documentation'),
   {source:'/status',destination:'/api/platform/status',permanent:false}
  ];
 }
};

export default nextConfig;
