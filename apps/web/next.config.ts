import type {NextConfig} from 'next';

const nextConfig:NextConfig={
 reactStrictMode:true,
 poweredByHeader:false,
 compress:true,
 trailingSlash:false,
 async redirects(){
  return [
   {source:'/index.html',destination:'/',permanent:true},
   {source:'/home',destination:'/',permanent:true},
   {source:'/status',destination:'/api/platform/status',permanent:false}
  ];
 }
};

export default nextConfig;
