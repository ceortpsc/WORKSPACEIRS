import type {Metadata} from 'next';
import Link from 'next/link';
import IrsFormCatalog from '../../components/irs-form-catalog';
import {mefFamilies,officialIrsSources} from '../../lib/irs-forms';
import './irs-form-catalog.css';

export const metadata:Metadata={
 title:'Official IRS Forms and Schedules Catalog',
 description:'Search current official IRS forms, schedules, instructions and publications and assemble governed filing-package checklists.',
 robots:{index:false,follow:false,noarchive:true}
};

export default function IrsFormCatalogPage(){
 return <>
  <section className="irs-catalog-hero"><div className="container irs-catalog-hero__grid"><div><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/resources">Resources</Link><span>/</span><span aria-current="page">IRS Forms Catalog</span></nav><span className="irs-kicker">Official-source tax product registry</span><h1>IRS forms, schedules and filing-product catalog</h1><p className="lead">Search current IRS.gov product metadata across common, specialized and uncommon forms, schedules, instructions and publications. Build controlled filing-package checklists while preserving tax-year, revision and e-file verification requirements.</p><div className="actions"><a className="ross-btn ross-btn--gold" href={officialIrsSources.currentCatalog} target="_blank" rel="noreferrer">Open complete IRS catalog ↗</a><Link className="ross-btn ross-btn--outline hero-outline" href="/efile-workbench">Open E-file Workbench</Link></div><div className="hero-meta"><span>IRS.gov only</span><span>Current revision metadata</span><span>Common and uncommon products</span><span>MeF family awareness</span><span>No taxpayer data required</span></div></div><aside className="irs-source-card"><div className="irs-source-card__seal">IRS</div><h2>Official-source discipline</h2><p>The catalog does not host altered copies or label a form e-file eligible merely because a PDF exists.</p><ul><li>Product metadata must originate from IRS.gov.</li><li>Revision and posted dates remain visible.</li><li>Prior-year forms use a separate official source.</li><li>MeF acceptance must be verified by family, tax year and active schema version.</li></ul></aside></div></section>

  <section className="section section--compact"><div className="container irs-catalog-metrics"><article><strong>1,600+</strong><span>current IRS product records indexed by the official catalog</span></article><article><strong>11</strong><span>filing classifications from individual through excise and international</span></article><article><strong>3</strong><span>usage tiers: common, specialized and rare</span></article><article><strong>6+</strong><span>major Modernized e-File return families</span></article></div></section>

  <section className="section"><div className="container"><IrsFormCatalog/></div></section>

  <section className="section section--muted"><div className="container"><div className="section-heading"><div><span className="irs-kicker">Modernized e-File</span><h2>Accepted-form and schema verification by return family</h2></div><p>A form appearing in the IRS publication catalog does not establish MeF acceptance. Software must verify the active family-specific accepted-forms list, attachment list, schema release, business rules, ATS dates and production dates.</p></div><div className="irs-mef-grid">{mefFamilies.map(family=><article key={family.name}><span>{family.name}</span><h3>{family.forms}</h3><a href={family.source} target="_blank" rel="noreferrer">Open official MeF source ↗</a></article>)}</div></div></section>

  <section className="section section--dark"><div className="container callout-grid"><div><span className="irs-kicker">Filing control rule</span><h2>Find the product. Verify the revision. Confirm the filing channel.</h2><p>Before a product enters an actual return, staff must confirm taxpayer applicability, tax year, revision, related instructions, signature requirements, e-file support, attachment rules, due date, authority and reviewer approval.</p></div><div className="callout-actions"><a className="ross-btn ross-btn--gold" href={officialIrsSources.priorYears} target="_blank" rel="noreferrer">Prior-year forms ↗</a><a className="ross-btn ross-btn--outline hero-outline" href={officialIrsSources.postReleaseChanges} target="_blank" rel="noreferrer">Post-release changes ↗</a></div></div></section>
 </>;
}
