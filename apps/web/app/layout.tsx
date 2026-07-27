import type {Metadata,Viewport} from 'next';
import Link from 'next/link';
import {primaryNavigation} from '../lib/routes';
import './globals.css';

const configuredSiteUrl=process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl=configuredSiteUrl?.startsWith('http')?configuredSiteUrl:'https://www.rosstaxsoftware.com';
const deployEnvironment=process.env.NEXT_PUBLIC_DEPLOY_ENV??process.env.AWS_BRANCH??'development';
const isIndexable=['production','main'].includes(deployEnvironment.toLowerCase());

export const metadata:Metadata={
 metadataBase:new URL(siteUrl),
 title:{default:'Ross Tax Pro Software Co.',template:'%s | Ross Tax Pro Software Co.'},
 description:'Enterprise tax operations, IRS integration architecture, ERO workflows, payroll, compliance, and secure client services.',
 applicationName:'WORKSPACEIRS',
 robots:isIndexable?{index:true,follow:true}:{index:false,follow:false,noarchive:true},
 openGraph:{type:'website',siteName:'Ross Tax Pro Software Co.',title:'Smarter Software. Stronger Results.',description:'Secure tax operations and professional software solutions.',url:siteUrl},
 twitter:{card:'summary_large_image',title:'Ross Tax Pro Software Co.',description:'Smarter Software. Stronger Results.'}
};

export const viewport:Viewport={themeColor:'#071a33',colorScheme:'light'};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header">
   <div className="container nav">
    <Link className="brand" href="/" aria-label="Ross Tax Pro Software Co. home"><span className="brand-mark">RT</span><span className="brand-copy">ROSS TAX <b>PRO</b><small>SOFTWARE CO.</small></span></Link>
    <nav className="nav-links" aria-label="Primary navigation">
     {primaryNavigation.map(route=><Link key={route.slug} href={`/${route.slug}`}>{route.title.replace('Tax and Software ','').replace('Professional ','')}</Link>)}
     <Link className="ross-btn ross-btn--gold nav-cta" href="/start">Get Started</Link>
    </nav>
   </div>
  </header>
  <main id="main-content">{children}</main>
  <footer className="footer">
   <div className="container footer-grid">
    <div><strong>Ross Tax Pro Software Co.</strong><p>Smarter Software. Stronger Results.</p><p className="footer-note">Enterprise tax operations, secure client services, governed integrations, and practitioner software.</p></div>
    <div><strong>Platform</strong><Link href="/services">Services</Link><Link href="/portal">Client Portal</Link><Link href="/ero">ERO Workspace</Link><Link href="/compliance">Security & Compliance</Link></div>
    <div><strong>System</strong><Link href="/api/health">Health</Link><Link href="/api/platform/status">Integration Status</Link><Link href="/api/routes">Route Directory API</Link><a href="mailto:ceo@rosstaxsoftware.com">ceo@rosstaxsoftware.com</a></div>
   </div>
   <div className="container footer-bottom"><span>© 2026 Ross Tax Pro Software Co. All rights reserved.</span><span>WORKSPACEIRS · {deployEnvironment}</span></div>
  </footer>
 </body></html>;
}
