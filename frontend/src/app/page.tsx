// src/app/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const { user, credits, setCredits } = useAuth();
  const [localCredits, setLocalCredits] = useState<number>(0);

  // Inicializar créditos para usuarios anónimos
  useEffect(() => {
    if (!user) {
      const storedCredits = localStorage.getItem("anonCredits");
      setLocalCredits(storedCredits ? parseInt(storedCredits) : 100); // 100 créditos iniciales para anónimos
    }
  }, [user]);

  // Función para probar el consumo de créditos
  const handleTestCreditConsumption = async () => {
    try {
      const response = await fetchAPI("/v1/api/test-credit-consumption", { method: "GET" });
      if (response.error) {
        alert(response.error);
      } else {
        alert("Crédito consumido exitosamente");
        if (user) {
          const userResponse = await fetchAPI("/v1/users/me");
          if (userResponse.data) {
            setCredits(userResponse.data.credits);
          }
        } else {
          const newCredits = localCredits - 1;
          setLocalCredits(newCredits);
          localStorage.setItem("anonCredits", newCredits.toString());
        }
      }
    } catch (err) {
      console.error("Error al consumir crédito:", err);
      alert("Error al consumir crédito");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section (Jumbotron) */}
      <div className="bg-blue-600 text-white py-16 px-8 rounded-lg text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Neptuno</h1>
        <p className="text-xl mb-6">
          Tu Framework SaaS para gestionar créditos y APIs de forma sencilla y escalable.
        </p>
        {user ? (
          <Link
            href="/user/dashboard"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
          >
            Ir al Dashboard
          </Link>
        ) : (
          <div>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold mr-4 hover:bg-gray-200"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>

      {/* Sección de Características */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Gestión de Créditos</h2>
          <p>
            Administra tus créditos fácilmente y prueba nuestras APIs con créditos gratuitos para
            usuarios nuevos.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">APIs Potentes</h2>
          <p>
            Accede a endpoints robustos y personalizables para integrar en tus proyectos.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Escalabilidad Segura</h2>
          <p>
            Un framework diseñado para crecer contigo, con seguridad de primer nivel.
          </p>
        </div>
      </div>

      {/* Botón de Prueba de Consumo de Créditos */}
      <div className="text-center mb-8">
        <p className="text-lg mb-4">
          Tienes {user ? credits : localCredits} créditos disponibles.
        </p>
        <button
          onClick={handleTestCreditConsumption}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
        >
          Probar Consumo de Crédito
        </button>
      </div>

      {/* Pruebas de Endpoints Públicos */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Prueba Nuestros Endpoints</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/info"
            className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200"
          >
            <h3 className="text-xl font-semibold">Get Info</h3>
            <p>Obtén información básica del sistema (público).</p>
          </Link>
          <Link
            href="/consultar"
            className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200"
          >
            <h3 className="text-xl font-semibold">Consultar</h3>
            <p>Realiza consultas protegidas con créditos.</p>
          </Link>
          <Link
            href="/example"
            className="bg-white p-4 rounded-lg shadow-md hover:bg-gray-200"
          >
            <h3 className="text-xl font-semibold">Example</h3>
            <p>Ejemplo práctico de uso de la API.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}