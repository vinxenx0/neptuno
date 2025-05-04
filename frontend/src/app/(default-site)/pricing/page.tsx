// frontend/src/app/(default-site)/pricing/page.tsx
'use client';

import Pricing from '@/components/default-site/Pricing';

export default function PricingPage() {
  return (
    <>
      {/* Hero de Precios */}
      <section className="bg-white py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Planes y Precios</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a las necesidades de tu negocio.
        </p>
      </section>

      {/* Tabla de Precios */}
      <Pricing />
    </>
  );
}
