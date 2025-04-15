import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "./api";
import { Gamification } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = "ws://127.0.0.1:8001";

export const useSocketNotifications = () => {
  const { user, setCredits, setGamification } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const sessionId = localStorage.getItem("session_id");
    const headers: { [key: string]: string } = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (sessionId) headers["X-Session-ID"] = sessionId;

    const newSocket = io(WS_URL, {
      path: "/ws/socket.io",
      transports: ["websocket"],
      extraHeaders: headers,
      perMessageDeflate: { threshold: 0 },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Conectado a WebSockets");
      setWsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Desconectado de WebSockets");
      setWsConnected(false);
    });

    newSocket.on("pointsUpdate", (data: { points: number }) => {
      setGamification({
        points: data.points,
        badges: []
      });
    });

    newSocket.on("newBadge", (data: { badge: string }) => {
      setGamification({
        points: 0, // You may want to use the latest points if available
        badges: [{ name: data.badge }],
      });
    });

    newSocket.on("message", (data: any) => {
      setUnreadMessages((prev) => prev + 1);
    });

    newSocket.on("adminBroadcast", (data: { message: string; from: string }) => {
      console.log(`Broadcast del admin (${data.from}): ${data.message}`);
      // Aquí podrías mostrar una notificación en la UI
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setWsConnected(false);
    };
  }, [user, setCredits, setGamification]);

  // Fallback con polling si WebSocket no está conectado
  useEffect(() => {
    if (!user || wsConnected) return;

    const interval = setInterval(async () => {
      try {
        const { data: infoData } = await fetchAPI<any>("/info");
        if (infoData) {
          setCredits(infoData.credits);
        }
        const { data: gamificationData } = await fetchAPI<any[]>("/v1/gamification/me");
        if (gamificationData) {
          const totalPoints = gamificationData.reduce((sum, g) => sum + g.points, 0);
          const badges = gamificationData.map((g) => g.badge).filter(Boolean);
          setGamification({ points: totalPoints, badges });
        }
        const { data: unreadData } = await fetchAPI<{ count: number }>("/v1/messages/unread");
        setUnreadMessages(unreadData?.count || 0);
      } catch (err) {
        console.error("Error en polling:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, wsConnected, setCredits, setGamification]);

  return { socket, wsConnected, unreadMessages, setUnreadMessages };
};