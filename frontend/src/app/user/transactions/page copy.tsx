"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  styled,
  Tabs,
  Tab
} from "@mui/material";
import {
  History,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

const TransactionCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  padding: theme.spacing(3),
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

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

  const filtered = transactions.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in') return t.amount > 0;
    if (activeTab === 'out') return t.amount < 0;
    return true;
  });

  if (!user) return null;

  return (
    <Box sx={{
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      p: { xs: 2, md: 4 }
    }}>
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h3"
            sx={{
              mb: 4,
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Historial de Transacciones
          </Typography>
        </motion.div>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 4 }}
        >
          <Tab label="Todas" value="all" />
          <Tab label="Entradas" value="in" />
          <Tab label="Salidas" value="out" />
        </Tabs>

        {filtered.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }}>
            <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No hay transacciones registradas
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Todas tus transacciones aparecerán aquí
            </Typography>
          </Box>
        ) : (
          <AnimatePresence>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: 3
              }}
            >
              {filtered.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TransactionCard>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: t.amount > 0 ? 'success.main' : 'error.main',
                          color: 'white'
                        }}
                      >
                        {t.amount > 0 ? <ArrowDownward /> : <ArrowUpward />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {t.transaction_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(t.timestamp).toLocaleString()} • {t.payment_status}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Typography
                      variant="h5"
                      color={t.amount > 0 ? "success.light" : "error.light"}
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {t.amount > 0 ? '+' : ''}{t.amount} créditos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.payment_amount ? `$${t.payment_amount.toFixed(2)}` : "N/A"} vía {t.payment_method || "N/A"}
                    </Typography>
                  </TransactionCard>
                </motion.div>
              ))}
            </Box>
          </AnimatePresence>
        )}
      </Box>
    </Box>
  );
}
