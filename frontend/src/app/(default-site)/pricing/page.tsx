
export default function PricingPage() {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <h2 className="text-3xl font-semibold mb-8">Planes y Precios</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Gratis", "Pro", "Empresa"].map((plan, index) => (
            <div key={plan} className="bg-white shadow rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">{plan}</h3>
              <p className="text-gray-600 mb-4">Ideal para {plan.toLowerCase()} usuarios</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-auto">Elegir</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  