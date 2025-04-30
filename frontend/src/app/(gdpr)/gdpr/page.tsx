// app/privacy/page.tsx (Next.js App Router)

import PrivacyCenter from '@/components/gdpr/PrivacyCenter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centro de Privacidad',
  description: 'Gestiona tus preferencias de privacidad y conoce cómo protegemos tus datos personales.',
}

export default function PrivacyPage() {
  return <PrivacyCenter />
}
