export default function FaqPage() {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Preguntas Frecuentes</h1>
        <ul className="space-y-4">
          {[
            { q: "¿Cómo empiezo?", a: "Puedes registrarte gratis en nuestra plataforma." },
            { q: "¿Ofrecen soporte?", a: "Sí, soporte vía chat y correo electrónico." },
          ].map((item, idx) => (
            <li key={idx}>
              <h4 className="font-semibold">{item.q}</h4>
              <p className="text-gray-600">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  