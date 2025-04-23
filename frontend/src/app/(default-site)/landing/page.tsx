import { Head } from "next/document";

export default function LandingPage() {
    return (
      <>
      <Head>
        <title>Sobre nosotros - Tu SaaS</title>
        <meta name="description" content="Conoce al equipo detrás de Tu SaaS y nuestra misión." />
      </Head>
      <section className="px-6 py-20 text-center bg-white">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a TuSaaS 🚀</h1>
        <p className="text-gray-600 mb-6">Transforma tu negocio con nuestra plataforma</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Probar Gratis
        </button>
      </section>
      </>
  );
}
     