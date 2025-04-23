export default function ServicesPage() {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Nuestros Servicios</h1>
        <ul className="grid md:grid-cols-2 gap-8">
          {["Automatización", "Análisis", "Integraciones", "Soporte Premium"].map(service => (
            <li key={service} className="bg-white p-6 shadow rounded">
              <h3 className="text-xl font-semibold mb-2">{service}</h3>
              <p className="text-gray-600">Descripción corta del servicio {service.toLowerCase()}.</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
// This code defines a React component that renders a services page with a list of services.
// Each service is displayed in a card format with a title and description.
// The component uses Tailwind CSS for styling and is designed to be responsive, adapting to different screen sizes.
// The services are displayed in a grid layout on larger screens and in a single column on smaller screens.
// The component is exported as the default export, making it available for use in other parts of the application.
// The services listed are "Automatización", "Análisis", "Integraciones", and "Soporte Premium".
// Each service has a placeholder description that can be replaced with actual content.
// The component is designed to be used in a Next.js application, as indicated by the use of the "page.tsx" file naming convention.  