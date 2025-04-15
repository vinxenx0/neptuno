// src/app/user/messages/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useSocketNotifications } from "@/lib/useSocketNotifications";
import fetchAPI from "@/lib/api";
import { Box, List, ListItem, ListItemText, TextField, Button, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";

interface Message {
  id: number;
  from: string;
  to_user_id: string;
  content: string;
  timestamp: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocketNotifications();
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [toUserId, setToUserId] = useState("");

  useEffect(() => {
    if (!user || user.user_type !== "registered") return;
    const fetchMessages = async () => {
      const { data } = await fetchAPI<Message[]>("/v1/messages");
      setMessages(data || []);
    };
    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on("message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => {
      socket.off("message");
    };
  }, [socket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !toUserId || !newMessage) return;
    const messageData = { to_user_id: toUserId, message: newMessage };
    const response = await socket.emit("message", messageData, (resp: any) => {
      if (resp.status === "Mensaje enviado") {
        setMessages((prev) => [...prev, resp.message]);
        setNewMessage("");
      } else {
        console.error(resp.error);
      }
    });
  };

  if (!user || user.user_type !== "registered") {
    return <Typography>No autorizado</Typography>;
  }

  return (
    <Box sx={{ p: 4, maxWidth: "800px", mx: "auto" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" gutterBottom>Mensajes</Typography>
        <Box component="form" onSubmit={handleSendMessage} sx={{ mb: 4, display: "flex", gap: 2 }}>
          <TextField
            label="ID del destinatario"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            size="small"
            variant="outlined"
          />
          <TextField
            label="Mensaje"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          />
          <Button type="submit" variant="contained" color="primary">
            Enviar
          </Button>
        </Box>
        <List sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 1 }}>
          {messages.map((msg) => (
            <ListItem key={msg.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
              <ListItemText
                primary={`${msg.from}: ${msg.content}`}
                secondary={new Date(msg.timestamp).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </motion.div>
    </Box>
  );
}