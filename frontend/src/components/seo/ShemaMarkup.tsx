// components/seo/SchemaMarkup.tsx
'use client'

import { JsonLd } from 'react-schemaorg'
import { Organization, WebPage } from 'schema-dts'

export function SchemaMarkup({ pageType = 'WebPage', pageTitle = '', pageDescription = '' }: {
  pageType?: 'WebPage' | 'AboutPage' | 'ContactPage',
  pageTitle?: string,
  pageDescription?: string
}) {
  return (
    <>
      <JsonLd<Organization>
        item={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Nombre de tu Aplicación",
          url: process.env.NEXT_PUBLIC_SITE_URL,
          logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
        }}
      />
      <JsonLd<WebPage>
        item={{
          "@context": "https://schema.org",
          "@type": pageType,
          name: pageTitle,
          description: pageDescription,
          url: typeof window !== 'undefined' ? window.location.href : '',
        }}
      />
    </>
  )
}