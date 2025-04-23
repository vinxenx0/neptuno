export default function ContactPage() {
    return (
      <div className="max-w-xl mx-auto py-16">
        <h2 className="text-3xl font-semibold mb-4">Contáctanos</h2>
        <form className="grid gap-4">
          <input className="p-3 border rounded" placeholder="Tu nombre" />
          <input className="p-3 border rounded" type="email" placeholder="Tu correo" />
          <textarea className="p-3 border rounded" placeholder="Mensaje" rows={4} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Enviar</button>
        </form>
      </div>
    );
  }