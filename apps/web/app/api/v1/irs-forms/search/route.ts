import {NextRequest} from 'next/server';
import {apiError,apiResponse,requestContext} from '../../../../../lib/api';
import {classifyProduct,officialIrsSources,type IrsProduct} from '../../../../../lib/irs-forms';

export const dynamic='force-dynamic';

const decodeEntities=(value:string)=>value
 .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'")
 .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
 .replace(/&#(\d+);/g,(_,code)=>String.fromCharCode(Number(code)));
const stripTags=(value:string)=>decodeEntities(value.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();

function officialIrsUrl(href:string){
 try{
  const url=new URL(href,'https://www.irs.gov');
  const host=url.hostname.toLowerCase();
  if(url.protocol!=='https:'||!(host==='irs.gov'||host.endsWith('.irs.gov')))return null;
  return url.toString();
 }catch{return null;}
}

function parseCatalog(html:string,sourceUrl:string):IrsProduct[]{
 const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
 const products:IrsProduct[]=[];
 for(const row of rows){
  const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(match=>match[1]);
  if(cells.length<4)continue;
  const anchor=cells[0].match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  if(!anchor)continue;
  const productUrl=officialIrsUrl(anchor[1]);
  if(!productUrl)continue;
  const productNumber=stripTags(anchor[2]);
  if(!/^(Form|Instruction|Publication|Schedule)\b/i.test(productNumber))continue;
  const title=stripTags(cells[1]);
  const revisionDate=stripTags(cells[2]);
  const postedDate=stripTags(cells[3]);
  const metadata=classifyProduct(productNumber,title);
  products.push({productNumber,title,revisionDate,postedDate,officialUrl:productUrl,sourceUrl,...metadata});
 }
 return products;
}

function parseTotal(html:string){
 const match=stripTags(html).match(/Showing\s+[\d,]+\s*-\s*[\d,]+\s+of\s+([\d,]+)/i);
 return match?Number(match[1].replace(/,/g,'')):null;
}

export async function GET(request:NextRequest){
 const context=requestContext(request);
 const query=(request.nextUrl.searchParams.get('q')??'').trim().slice(0,120);
 const page=Math.max(0,Math.min(100,Number(request.nextUrl.searchParams.get('page')??0)||0));
 const pageSize=[25,50,100,200].includes(Number(request.nextUrl.searchParams.get('pageSize')))?Number(request.nextUrl.searchParams.get('pageSize')):50;
 const productType=request.nextUrl.searchParams.get('type')??'all';
 const category=request.nextUrl.searchParams.get('category')??'all';
 const usage=request.nextUrl.searchParams.get('usage')??'all';
 const source=new URL(officialIrsSources.currentCatalog);
 if(query)source.searchParams.set('find',query);
 source.searchParams.set('page',String(page));
 source.searchParams.set('items_per_page',String(pageSize));
 try{
  const response=await fetch(source,{headers:{'User-Agent':'WORKSPACEIRS/1.0 official-forms-catalog','Accept':'text/html'},next:{revalidate:21600}});
  if(!response.ok)return apiError('IRS_CATALOG_UNAVAILABLE',`The official IRS catalog returned HTTP ${response.status}.`,503,context.correlationId,{source:source.toString()});
  const html=await response.text();
  const totalReportedByIrs=parseTotal(html);
  const parsed=parseCatalog(html,source.toString());
  if(parsed.length===0&&totalReportedByIrs!==0)return apiError('IRS_CATALOG_PARSE_FAILURE','IRS.gov responded, but no verified product rows could be parsed. The catalog is blocked until the official page structure is reviewed.',503,context.correlationId,{source:source.toString(),totalReportedByIrs});
  const items=parsed.filter(item=>(productType==='all'||item.productType===productType)&&(category==='all'||item.filingCategory===category)&&(usage==='all'||item.usageTier===usage));
  return apiResponse({ok:true,source:{agency:'Internal Revenue Service',official:true,url:source.toString(),retrievedAt:new Date().toISOString()},query:{q:query,page,pageSize,productType,category,usage},totalReportedByIrs,returned:items.length,items,disclaimer:'Catalog metadata is retrieved from IRS.gov. Filing applicability, e-file acceptance, and revision status must be verified for the taxpayer, tax year, return family, and active IRS schema release.'},200,context.correlationId);
 }catch(error){
  return apiError('IRS_CATALOG_UNAVAILABLE',error instanceof Error?error.message:'The official IRS catalog could not be reached.',503,context.correlationId,{source:source.toString()});
 }
}
