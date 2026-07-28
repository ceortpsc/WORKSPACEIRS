import Link from 'next/link';
import type {CertificationEvidence,EvidenceDomain} from '../lib/application-certification';
import {certificationSummary} from '../lib/application-certification';

const labels:Record<EvidenceDomain,string>={APPLICATION:'Application',EFILE:'E-file',SECURITY:'Security',INFRASTRUCTURE:'Infrastructure',INTEGRATIONS:'Integrations'};
const hrefs:Record<EvidenceDomain,string>={APPLICATION:'/certification/application',EFILE:'/certification/efile',SECURITY:'/certification/security',INFRASTRUCTURE:'/certification/infrastructure',INTEGRATIONS:'/certification/integrations'};
const statusStyle=(status:string)=>({PASS:{background:'#e7f7ee',color:'#11643b',border:'1px solid #8dd2aa'},FAIL:{background:'#feeceb',color:'#9c1c18',border:'1px solid #efaaa6'},BLOCKED:{background:'#fff4db',color:'#7b5100',border:'1px solid #e5c679'},NOT_TESTED:{background:'#eef1f5',color:'#495364',border:'1px solid #cbd2dc'}}[status]??{});

export default function CertificationDashboard({domain,title,subtitle}:{domain?:EvidenceDomain;title:string;subtitle:string}){
 const summary=certificationSummary(domain);
 return <main style={{minHeight:'100vh',background:'linear-gradient(145deg,#071426,#0d2442 55%,#111b2d)',color:'#f8fafc',padding:'40px 22px 72px'}}>
  <div style={{maxWidth:1240,margin:'0 auto'}}>
   <section style={{border:'1px solid rgba(212,175,55,.38)',borderRadius:24,padding:'34px',background:'rgba(6,18,35,.82)',boxShadow:'0 24px 70px rgba(0,0,0,.32)'}}>
    <div style={{fontSize:12,letterSpacing:2.2,textTransform:'uppercase',color:'#d4af37',fontWeight:800}}>RTPSC Production Certification Fabric</div>
    <h1 style={{fontSize:'clamp(34px,5vw,64px)',lineHeight:1.02,margin:'14px 0 12px'}}>{title}</h1>
    <p style={{maxWidth:860,color:'#c8d1df',fontSize:18,lineHeight:1.65,margin:0}}>{subtitle}</p>
    <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:26}}>
     {(Object.keys(labels) as EvidenceDomain[]).map(item=><Link key={item} href={hrefs[item]} style={{textDecoration:'none',padding:'10px 14px',borderRadius:999,border:`1px solid ${domain===item?'#d4af37':'rgba(255,255,255,.18)'}`,color:domain===item?'#081426':'#e8edf5',background:domain===item?'#d4af37':'rgba(255,255,255,.05)',fontWeight:750}}>{labels[item]}</Link>)}
     <Link href="/certification" style={{textDecoration:'none',padding:'10px 14px',borderRadius:999,border:`1px solid ${!domain?'#d4af37':'rgba(255,255,255,.18)'}`,color:!domain?'#081426':'#e8edf5',background:!domain?'#d4af37':'rgba(255,255,255,.05)',fontWeight:750}}>All Evidence</Link>
    </div>
   </section>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,margin:'22px 0'}}>
    <Metric label="Required controls" value={summary.total}/><Metric label="PASS" value={summary.counts.PASS}/><Metric label="BLOCKED" value={summary.counts.BLOCKED}/><Metric label="FAIL" value={summary.counts.FAIL}/><Metric label="Certification" value={summary.certified?'PASS':'NOT READY'} />
   </section>

   <section style={{display:'grid',gap:14}}>{summary.evidence.map(item=><EvidenceCard key={item.id} item={item}/>)}</section>

   <section style={{marginTop:24,padding:22,borderRadius:18,border:'1px solid rgba(255,255,255,.16)',background:'rgba(255,255,255,.045)'}}>
    <h2 style={{margin:'0 0 8px'}}>Certification rule</h2>
    <p style={{margin:0,color:'#c8d1df',lineHeight:1.65}}>A control is marked PASS only when its required verification flag and evidence references are configured. Application code, an interface, or an integration contract alone does not constitute external authorization or production certification.</p>
   </section>
  </div>
 </main>
}

function Metric({label,value}:{label:string;value:string|number}){return <div style={{padding:20,borderRadius:18,border:'1px solid rgba(255,255,255,.14)',background:'rgba(255,255,255,.055)'}}><div style={{fontSize:12,textTransform:'uppercase',letterSpacing:1.4,color:'#9fb0c6'}}>{label}</div><div style={{fontSize:28,fontWeight:900,marginTop:8,color:label==='PASS'?'#7ee2a8':label==='BLOCKED'||label==='FAIL'?'#f1c66b':'#f8fafc'}}>{value}</div></div>}

function EvidenceCard({item}:{item:CertificationEvidence}){return <article style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:18,padding:22,borderRadius:18,border:'1px solid rgba(255,255,255,.14)',background:'rgba(255,255,255,.05)'}}>
 <div><div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><strong style={{fontSize:18}}>{item.title}</strong><code style={{color:'#94a8bf'}}>{item.id}</code></div><p style={{color:'#c8d1df',lineHeight:1.55,margin:'9px 0'}}>{item.description}</p><div style={{fontSize:13,color:'#94a8bf'}}>Owner: {item.owner} · Evaluated: {item.lastEvaluatedAt}</div>
 {item.evidence.length>0&&<div style={{marginTop:12}}><strong style={{color:'#7ee2a8'}}>Evidence</strong><ul style={{margin:'7px 0 0',color:'#d8e1ec'}}>{item.evidence.map(entry=><li key={entry}>{entry}</li>)}</ul></div>}
 {item.blockers.length>0&&<div style={{marginTop:12}}><strong style={{color:'#f1c66b'}}>Blockers</strong><ul style={{margin:'7px 0 0',color:'#f2d79a'}}>{item.blockers.map(entry=><li key={entry}>{entry}</li>)}</ul></div>}</div>
 <div><span style={{...statusStyle(item.status),display:'inline-block',padding:'8px 12px',borderRadius:999,fontWeight:900,fontSize:12,letterSpacing:1}}>{item.status}</span></div>
 </article>}
