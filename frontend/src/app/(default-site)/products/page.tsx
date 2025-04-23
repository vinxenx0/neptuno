export default function ProductsPage() {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Funcionalidades del Producto</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {["Panel de control", "API REST", "Métricas en tiempo real"].map((feature) => (
            <div key={feature} className="p-6 bg-white rounded shadow">
              <h3 className="text-xl font-semibold mb-2">{feature}</h3>
              <p className="text-gray-600">Explicación de cómo esta funcionalidad ayuda al usuario.</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  