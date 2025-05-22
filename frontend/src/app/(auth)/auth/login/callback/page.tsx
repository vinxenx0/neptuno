"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth/context";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const provider = window.location.pathname.includes("google") ? "google" : "meta";
      if (code) {
        try {
          const response = await fetchAPI("/v1/auth/login/" + provider + "/callback", {
            method: "POST",
            data: { code },
          });
          if (
            response.data &&
            typeof response.data === "object" &&
            "access_token" in response.data &&
            "refresh_token" in response.data
          ) {
            const data = response.data as { access_token: string; refresh_token: string };
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("refreshToken", data.refresh_token);
            await refreshToken(); // Actualiza el estado del usuario
            router.push("/user/");
          } else {
            router.push("/auth/login?error=auth_failed");
          }
        } catch (err) {
          router.push("/auth/login?error=auth_failed");
        }
      } else {
        router.push("/auth/login?error=missing_code");
      }
    };
    handleCallback();
  }, [searchParams, router, refreshToken]);

  return <div>Procesando autenticación...</div>;
}