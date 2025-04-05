// src/app/user/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
} from "@mui/material";
import { History } from "@mui/icons-material";

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/user/auth/#login");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data } = await fetchAPI<CreditTransaction[]>("/v1/payments/transactions");
        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar transacciones");
      }
    };
    fetchTransactions();
  }, [user, router]);

  if (!user) return null;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
      <Box sx={{ maxWidth: "1000px", mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
            Historial de Transacciones
          </Typography>
        </motion.div>

        <Paper sx={{ p: 2, borderRadius: "12px" }}>
          {transactions.length === 0 ? (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
              No hay transacciones registradas
            </Typography>
          ) : (
            <List sx={{ maxHeight: "600px", overflow: "auto" }}>
              {transactions.map((t) => (
                <div key={t.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: t.amount > 0 ? "success.light" : "error.light",
                        }}
                      >
                        {t.amount > 0 ? "+" : "-"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={t.transaction_type}
                      secondary={`${new Date(t.timestamp).toLocaleString()} • ${t.payment_status}`}
                    />
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="subtitle1"
                        color={t.amount > 0 ? "success.main" : "error.main"}
                      >
                        {t.amount > 0 ? "+" : ""}{t.amount} créditos
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {t.payment_amount ? `$${t.payment_amount.toFixed(2)}` : "N/A"} vía{" "}
                        {t.payment_method || "N/A"}
                      </Typography>
                    </Box>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}