// frontend/src/app/(default-site)/contact/page.tsx
'use client';

import Contact from '@/components/default-site/Contact';

export default function ContactPage() {
  return (
    <>
      {/* Hero de Contacto */}
      <section className="bg-white py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Contáctanos</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          ¿Tienes preguntas o necesitas más información? Estamos aquí para ayudarte.
        </p>
      </section>

      {/* Formulario de Contacto */}
      <Contact />
    </>
  );
}
