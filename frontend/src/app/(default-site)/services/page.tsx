// frontend/src/app/(default-site)/services/page.tsx
'use client';

import Services from '@/components/default-site/Services';

export default function ServicesPage() {
  return (
    <>
      {/* Hero de Servicios */}
      <section className="bg-white py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Nuestros Servicios</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Descubre cómo nuestras soluciones pueden impulsar tu negocio.
        </p>
      </section>

      {/* Listado de Servicios */}
      <Services />
    </>
  );
}
