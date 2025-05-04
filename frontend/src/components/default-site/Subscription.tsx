// frontend/src/components/default-site/Subscription.tsx
'use client';

import Link from "next/link";

export default function Subscription() {
  const plans = [
    {
      name: 'Básico',
      price: 'Gratis',
      features: ['1 usuario', 'Soporte limitado', 'Acceso básico'],
    },
    {
      name: 'Pro',
      price: '$29/mes',
      features: ['Hasta 10 usuarios', 'Soporte prioritario', 'Acceso completo'],
    },
    {
      name: 'Empresa',
      price: 'Personalizado',
      features: ['Usuarios ilimitados', 'Soporte dedicado', 'Integraciones avanzadas'],
    },
  ];

  return (
    <section className="py-20 bg-white px-6 text-center">
      <Link href="/pricing" passHref>
  <h2 className="text-3xl font-semibold mb-4 text-blue-600 hover:underline transition">
    Planes de Suscripción
  </h2>
</Link>

      <p className="text-gray-600 mb-10">Escoge el plan que mejor se adapte a tu negocio</p>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className="border p-6 rounded-xl hover:shadow-md transition text-left"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
            <p className="text-2xl font-semibold text-blue-600 mb-4">{plan.price}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {plan.features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
            <button className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Elegir
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
