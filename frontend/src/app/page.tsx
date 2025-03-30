// src/app/page.tsx
// src/app/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import { User } from "@/lib/types";

export default function LandingPage() {
  const { user, credits, setCredits } = useAuth();
  const [localCredits, setLocalCredits] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!user) {
      const storedCredits = localStorage.getItem("anonCredits");
      const initialCredits = storedCredits ? parseInt(storedCredits) : 100;
      setLocalCredits(initialCredits);
      setCredits(initialCredits); // Sincronizar con el contexto
    }
  }, [user, setCredits]);

  const handleTestCreditConsumption = async () => {
    try {
      const response = await fetchAPI("/v1/api/test-credit-consumption", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } else {
        if (user) {
          const userResponse = await fetchAPI<User>("/v1/users/me");
          if (userResponse.data) {
            setCredits(userResponse.data.credits);
          }
        } else {
          const newCredits = localCredits - 1;
          setLocalCredits(newCredits);
          setCredits(newCredits);
          localStorage.setItem("anonCredits", newCredits.toString());
        }
        setSnackbarMessage("Crédito consumido exitosamente");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error al consumir crédito:", err);
      setSnackbarMessage("Error al consumir crédito");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleNoLoginTest = async () => {
    try {
      const response = await fetchAPI("/no-login/", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Consulta sin login realizada: " + (response.data as { message: string }).message);
        setSnackbarSeverity("success");
        if (!user) {
          const newCredits = localCredits - 1;
          setLocalCredits(newCredits);
          setCredits(newCredits);
          localStorage.setItem("anonCredits", newCredits.toString());
        }
      }
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error en consulta sin login:", err);
      setSnackbarMessage("Error en consulta sin login");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRestrictedTest = async () => {
    try {
      const response = await fetchAPI("/restricted", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Consulta restringida realizada: " + (response.data as { message: string }).message);
        setSnackbarSeverity("success");
      }
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error en consulta restringida:", err);
      setSnackbarMessage("Error en consulta restringida");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleInfo = async () => {
    try {
      const response = await fetchAPI("/info", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Información obtenida: " + JSON.stringify(response.data));
        setSnackbarSeverity("success");
      }
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error al obtener información:", err);
      setSnackbarMessage("Error al obtener información");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="container mx-auto p-">
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
              href="/user/auth/#register"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold mr-4 hover:bg-gray-200"
            >
              Registrarse
            </Link>
            <Link
              href="/user/auth/#login"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Iniciar Sesión
            </Link>
          </div>
        )}
      </div>

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

      <div className="text-center mb-8">
        <p className="text-lg mb-4">
          Tienes {user ? credits : localCredits} créditos disponibles.
        </p>
        <Button
          variant="contained"
          color="success"
          onClick={handleTestCreditConsumption}
          className="px-6 py-3 font-semibold"
        >
          Probar Consumo de Crédito
        </Button>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Prueba Nuestros Endpoints</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="contained"
            onClick={handleNoLoginTest}
            className="bg-blue-500 text-white"
          >
            Probar /v1/api/no-login/
          </Button>
          <Button
            variant="contained"
            onClick={handleRestrictedTest}
            className="bg-green-500 text-white"
          >
            Probar /v1/api/restricted
          </Button>
          <Button
            variant="contained"
            onClick={handleInfo}
            className="bg-purple-500 text-white"
          >
            Obtener /v1/api//info
          </Button>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}