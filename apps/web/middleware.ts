import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const resolveApiOrigin=(request:NextRequest)=>{
 try{return new URL(process.env.NEXT_PUBLIC_API_BASE_URL??request.nextUrl.origin).origin;}
 catch{return request.nextUrl.origin;}
};

export function middleware(request:NextRequest){
 const requestHeaders=new Headers(request.headers);
 const requestId=requestHeaders.get('x-request-id')??crypto.randomUUID();
 requestHeaders.set('x-request-id',requestId);

 const response=NextResponse.next({request:{headers:requestHeaders}});
 const apiOrigin=resolveApiOrigin(request);
 const contentSecurityPolicy=[
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiOrigin} wss:`,
  "upgrade-insecure-requests"
 ].join('; ');

 response.headers.set('x-request-id',requestId);
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('X-Frame-Options','DENY');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
 response.headers.set('Cross-Origin-Opener-Policy','same-origin');
 response.headers.set('Cross-Origin-Resource-Policy','same-origin');
 response.headers.set('Content-Security-Policy',contentSecurityPolicy);
 if(request.nextUrl.protocol==='https:')response.headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains; preload');
 return response;
}

export const config={matcher:'/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'};
