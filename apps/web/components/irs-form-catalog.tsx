'use client';

import {useEffect,useMemo,useState} from 'react';
import type {IrsProduct} from '../lib/irs-forms';
import {starterFilingSets} from '../lib/irs-forms';

type SearchResponse={ok:boolean;totalReportedByIrs:number|null;returned:number;items:IrsProduct[];error?:{message:string};source?:{url:string;retrievedAt:string}};

const categoryOptions=[['all','All filing categories'],['individual','Individual'],['business','Business'],['employment','Employment and payroll'],['information-reporting','Information reporting'],['estate-gift-trust','Estate, gift and trust'],['tax-exempt','Tax-exempt'],['international','International'],['excise','Excise'],['representation-collection','Representation and collection'],['retirement','Retirement'],['general','General']];
const typeOptions=[['all','All product types'],['form','Forms'],['schedule','Schedules'],['instruction','Instructions'],['publication','Publications']];
const usageOptions=[['all','Common and uncommon'],['common','Common'],['specialized','Specialized'],['rare','Rare and uncommon']];

export default function IrsFormCatalog(){
 const [query,setQuery]=useState('');const [category,setCategory]=useState('all');const [type,setType]=useState('all');const [usage,setUsage]=useState('all');const [page,setPage]=useState(0);
 const [data,setData]=useState<SearchResponse|null>(null);const [loading,setLoading]=useState(false);const [error,setError]=useState('');
 const [filingSet,setFilingSet]=useState<IrsProduct[]>([]);

 useEffect(()=>{try{const stored=localStorage.getItem('rtpsc-irs-filing-set');if(stored)setFilingSet(JSON.parse(stored));}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem('rtpsc-irs-filing-set',JSON.stringify(filingSet));}catch{}},[filingSet]);

 async function search(nextPage=0){
  setLoading(true);setError('');setPage(nextPage);
  const params=new URLSearchParams({q:query,page:String(nextPage),pageSize:'50',category,type,usage});
  try{const response=await fetch(`/api/v1/irs-forms/search?${params.toString()}`,{cache:'no-store'});const payload=await response.json() as SearchResponse;if(!response.ok||!payload.ok)throw new Error(payload.error?.message??'IRS catalog lookup failed.');setData(payload);}catch(reason){setError(reason instanceof Error?reason.message:'IRS catalog lookup failed.');setData(null);}finally{setLoading(false);}
 }
 useEffect(()=>{void search(0);},[]);

 function add(item:IrsProduct){setFilingSet(current=>current.some(existing=>existing.productNumber===item.productNumber&&existing.revisionDate===item.revisionDate)?current:[...current,item]);}
 function remove(item:IrsProduct){setFilingSet(current=>current.filter(existing=>!(existing.productNumber===item.productNumber&&existing.revisionDate===item.revisionDate)));}
 function loadStarter(name:string){const set=starterFilingSets.find(item=>item.name===name);if(!set)return;setQuery(set.forms.join(' OR '));setCategory('all');setType('all');setUsage('all');}
 const grouped=useMemo(()=>filingSet.reduce<Record<string,IrsProduct[]>>((result,item)=>{const key=item.filingCategory;result[key]??=[];result[key].push(item);return result;},{}),[filingSet]);

 return <div className="irs-catalog-widget">
  <section className="irs-search-panel" aria-labelledby="irs-search-title">
   <div className="irs-panel-heading"><div><span className="irs-kicker">Official IRS.gov lookup</span><h2 id="irs-search-title">Search forms, schedules, instructions and publications</h2></div><a href="https://www.irs.gov/forms-instructions-and-publications" target="_blank" rel="noreferrer">Open IRS source ↗</a></div>
   <div className="irs-search-grid">
    <label className="irs-query"><span>Product number, title or topic</span><input value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Enter')void search(0);}} placeholder="Examples: 1040, Schedule C, 706, excise, foreign, 2848"/></label>
    <label><span>Filing category</span><select value={category} onChange={event=>setCategory(event.target.value)}>{categoryOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label><span>Product type</span><select value={type} onChange={event=>setType(event.target.value)}>{typeOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label><span>Usage tier</span><select value={usage} onChange={event=>setUsage(event.target.value)}>{usageOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <button className="ross-btn ross-btn--gold" onClick={()=>void search(0)} disabled={loading}>{loading?'Searching IRS.gov…':'Search official catalog'}</button>
   </div>
   <div className="irs-starter-sets"><strong>Starter filing sets</strong>{starterFilingSets.map(set=><button key={set.name} onClick={()=>loadStarter(set.name)}>{set.name}</button>)}</div>
  </section>

  <section className="irs-results" aria-live="polite">
   <div className="irs-results-heading"><div><span className="irs-kicker">Catalog results</span><h2>{data?.totalReportedByIrs?`${data.totalReportedByIrs.toLocaleString()} products reported by IRS`:'Official product results'}</h2></div>{data?.source&&<small>Retrieved {new Date(data.source.retrievedAt).toLocaleString()}</small>}</div>
   {error&&<div className="irs-error"><strong>Lookup unavailable</strong><p>{error}</p><a href="https://www.irs.gov/forms-instructions-and-publications" target="_blank" rel="noreferrer">Continue on IRS.gov ↗</a></div>}
   {!error&&loading&&<div className="irs-loading">Retrieving current IRS catalog metadata…</div>}
   {!loading&&data&&<div className="irs-result-grid">{data.items.map(item=><article className="irs-product-card" key={`${item.productNumber}-${item.revisionDate}-${item.officialUrl}`}>
    <div className="irs-product-meta"><span>{item.productType}</span><span>{item.usageTier}</span><span>{item.language}</span></div>
    <h3>{item.productNumber}</h3><p>{item.title}</p>
    <dl><div><dt>Revision</dt><dd>{item.revisionDate||'Not listed'}</dd></div><div><dt>Posted</dt><dd>{item.postedDate||'Not listed'}</dd></div><div><dt>Category</dt><dd>{item.filingCategory.replaceAll('-',' ')}</dd></div><div><dt>MeF family</dt><dd>{item.efileFamily??'Verify separately'}</dd></div></dl>
    <div className="irs-card-actions"><a href={item.officialUrl} target="_blank" rel="noreferrer">Open official product ↗</a><button onClick={()=>add(item)} disabled={filingSet.some(existing=>existing.productNumber===item.productNumber&&existing.revisionDate===item.revisionDate)}>Add to filing set</button></div>
   </article>)}</div>}
   {!loading&&data&&data.items.length===0&&<div className="irs-empty">No products matched these local filters. Broaden the category, type or usage tier, or search directly on IRS.gov.</div>}
   <div className="irs-pagination"><button disabled={loading||page===0} onClick={()=>void search(page-1)}>← Previous</button><span>IRS results page {page+1}</span><button disabled={loading||!data||data.returned===0} onClick={()=>void search(page+1)}>Next →</button></div>
  </section>

  <aside className="irs-filing-set" aria-labelledby="filing-set-title">
   <div className="irs-panel-heading"><div><span className="irs-kicker">Local workspace</span><h2 id="filing-set-title">Filing package builder</h2></div><button onClick={()=>setFilingSet([])} disabled={filingSet.length===0}>Clear set</button></div>
   <p>Build a non-taxpayer-specific checklist of official products. This browser workspace stores product metadata only; it does not prepare, sign or transmit a return.</p>
   {filingSet.length===0?<div className="irs-empty">Add official products from the catalog to assemble a filing package.</div>:Object.entries(grouped).map(([group,items])=><section className="irs-set-group" key={group}><h3>{group.replaceAll('-',' ')}</h3>{items.map(item=><div className="irs-set-item" key={`${item.productNumber}-${item.revisionDate}`}><div><strong>{item.productNumber}</strong><small>{item.title}</small></div><button onClick={()=>remove(item)}>Remove</button></div>)}</section>)}
   <div className="irs-set-summary"><strong>{filingSet.length}</strong><span>official products in this filing set</span></div>
  </aside>
 </div>;
}
