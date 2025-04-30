import CookieBanner from '@/components/CookieBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieBanner />
    </>
  )
}
