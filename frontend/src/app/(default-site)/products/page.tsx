// frontend/src/app/(default-site)/products/page.tsx
'use client';

import Products from '@/components/default-site/Products';

export default function ProductsPage() {
  return (
    <>
      {/* Hero de Productos */}
      <section className="bg-white py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Características del Producto</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Conoce las funcionalidades que hacen única nuestra plataforma.
        </p>
      </section>

      {/* Detalles de Productos */}
      <Products />
    </>
  );
}
