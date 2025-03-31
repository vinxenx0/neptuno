// frontend/src/app/about/[page]/page.tsx
import { notFound } from "next/navigation";
import dynamic from 'next/dynamic';

const componentMap = {
  us: dynamic(() => import('./us')),
  policy: dynamic(() => import('./policy')),
  contact: dynamic(() => import('./contact')),
  privacy: dynamic(() => import('./privacy')),
} as const;

export async function generateStaticParams() {
  return Object.keys(componentMap).map((page) => ({ page }));
}

export default async function AboutPage({ params }: { params: Promise<{ page: keyof typeof componentMap }> }) {
  // Desestructuramos el Promise de params
  const { page } = await params;
  
  const Component = componentMap[page];
  return Component ? <Component /> : notFound();
}