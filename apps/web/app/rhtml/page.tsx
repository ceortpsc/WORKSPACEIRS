import type {Metadata} from 'next';
import Link from 'next/link';
import {HomepageRenderingSystem} from '../../components/homepage-rendering-system';

export const metadata:Metadata={title:'RHTML Rendering System',description:'Advanced rich HTML rendering system for WORKSPACEIRS homepages, route index, and non-generic production components.'};

export default function RhtmlPage(){
 return <><section className="notice-band"><div className="container"><strong>RHTML production surface:</strong> this page mirrors the deployed executive homepage rendering system for review, QA, and route-index navigation. <Link href="/platform-index">Open the full multi-page index</Link>.</div></section><HomepageRenderingSystem/></>;
}
