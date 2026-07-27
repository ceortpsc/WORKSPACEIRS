import type {Metadata,Viewport} from 'next';
import Link from 'next/link';
import {primaryNavigation} from '../lib/routes';
import './globals.css';
import './enhancements.css';
import './operations.css';

const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl=configuredSiteUrl?.startsWith('http')?configuredSiteUrl:'https://www.rosstaxsoftware.com';
const deployEnvironment=process.env.DEPLOYMENT_STAGE??process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??'development';
const isIndexable=['production','main'].includes(deployEnvironment.toLowerCase());

export const metadata:Metadata={
 metadataBase:new URL(siteUrl),
 title:{default:'Ross Tax Pro Software Co.',template:'%s | Ross Tax Pro Software Co.'},
 description:'Governed tax-practice operations, ERO controls, ETRAC intelligence, payroll, compliance, and secure client services.',
 applicationName:'WORKSPACEIRS',
 robots:isIndexable?{index:true,follow:true}:{index:false,follow:false,noarchive:true},
 openGraph:{type:'website',siteName:'Ross Tax Pro Software Co.',title:'Smarter Software. Stronger Practice Results.',description:'RTPSC Operations Fabric for taxpayers, practitioners, EROs, and multi-office operations.',url:siteUrl},
 twitter:{card:'summary_large_image',title:'Ross Tax Pro Software Co.',description:'Smarter Software. Stronger Practice Results.'}
};

export const viewport:Viewport={themeColor:'#071a33',colorScheme:'light'};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header"><div className="container nav"><Link className="brand" href="/" aria-label="Ross Tax Pro Software Co. home"><span className="brand-mark">RT</span><span className="brand-copy">ROSS TAX <b>PRO</b><small>SOFTWARE CO.</small></span></Link><nav className="nav-links" aria-label="Primary navigation">{primaryNavigation.map(route=><Link key={route.slug} href={`/${route.slug}`}>{route.title.replace('Tax and Software ','').replace('Professional ','')}</Link>)}<Link href="/operations-fabric">Operations</Link><Link className="ross-btn ross-btn--gold nav-cta" href="/start">Start Secure Intake</Link></nav></div></header>
  <main id="main-content">{children}</main>
  <footer className="footer"><div className="container footer-grid"><div><strong>Ross Tax Pro Software Co.</strong><p>Smarter Software. Stronger Practice Results.</p><p className="footer-note">Governed tax operations, secure client service, ETRAC intelligence, evidence-first workflows, and fail-closed integrations.</p></div><div><strong>Platform</strong><Link href="/operations-fabric">Operations Fabric</Link><Link href="/client-portal">Client Portal</Link><Link href="/practitioner-work-zone">Practitioner Work Zone</Link><Link href="/compliance">Security & Compliance</Link></div><div><strong>System</strong><Link href="/api/health">Health</Link><Link href="/api/platform/status">Runtime Status</Link><Link href="/api/v1/integrations">Adapter Registry</Link><Link href="/api/v1/operations/overview">Operations API</Link><a href="mailto:ceo@rosstaxsoftware.com">ceo@rosstaxsoftware.com</a></div></div><div className="container footer-bottom"><span>© 2026 Ross Tax Pro Software Co. All rights reserved.</span><span>WORKSPACEIRS · {deployEnvironment}</span></div></footer>
 </body></html>;
}
