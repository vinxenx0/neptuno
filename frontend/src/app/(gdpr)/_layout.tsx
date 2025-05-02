import CookieConsentBanner from '@/components/gdpr/CookieConsentBanner'


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentBanner onClose={undefined} />
    </>
  )
}
