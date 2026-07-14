import type {Metadata} from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata:Metadata={
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://www.rosstaxsoftware.com'),
  title:{default:'Ross Tax Pro Software Co.',template:'%s | Ross Tax Pro Software Co.'},
  description:'Enterprise tax operations, IRS integration architecture, ERO workflows, payroll, compliance, and secure client services.',
  robots:{index:true,follow:true},
  openGraph:{type:'website',siteName:'Ross Tax Pro Software Co.',title:'Smarter Software. Stronger Results.',description:'Secure tax operations and professional software solutions.'}
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>
  <header className="site-header"><div className="container nav">
   <Link className="brand" href="/">ROSS TAX <span>PRO</span></Link>
   <nav className="nav-links" aria-label="Primary navigation">
    <Link href="/services">Services</Link><Link href="/resources">Resources</Link><Link href="/compliance">Compliance</Link><Link href="/contact">Contact</Link><Link className="ross-btn ross-btn-primary" href="/start">Get Started</Link>
   </nav>
  </div></header>
  <main>{children}</main>
  <footer className="footer"><div className="container"><strong>Ross Tax Pro Software Co.</strong><p>Smarter Software. Stronger Results.</p><p>© 2026 Ross Tax Pro Software Co. All rights reserved. · <a href="mailto:ceo@rosstaxsoftware.com">ceo@rosstaxsoftware.com</a></p></div></footer>
 </body></html>
}
