import Link from 'next/link';

export default function NotFound(){
 return <section className="page-hero"><div className="container"><div className="eyebrow">404 · Route Not Found</div><h1>This page is not in the governed application directory.</h1><p className="lead">The route may have moved, may require a different workspace, or may not be released.</p><div className="actions"><Link className="ross-btn ross-btn--gold" href="/">Return Home</Link><Link className="ross-btn ross-btn--outline" href="/#platform-directory">Open Application Directory</Link></div></div></section>;
}
