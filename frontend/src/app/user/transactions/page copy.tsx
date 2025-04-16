// frontend/src/app/user/transactions/page.tsx
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
  Paid,
  CreditCard,
  AccountBalance,
  CheckCircle,
  Pending,
  Error
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
  background: 'rgba(248, 249, 250, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: theme.shadows[4],
  border: '1px solid rgba(222, 226, 230, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    background: 'rgba(248, 249, 250, 0.95)'
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '2px'
  },
  '& .MuiTab-root': {
    color: theme.palette.text.primary,
    opacity: 0.8,
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'capitalize',
    padding: '12px 16px',
    minHeight: 'auto',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      opacity: 1,
      fontWeight: 600
    },
    '&:hover': {
      opacity: 1,
      color: theme.palette.primary.dark
    }
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '2px 8px',
  height: 'auto',
  color: 'white',
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.main
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.main
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.main
  }
}));

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [enableCredits, setEnableCredits] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSettingsAndFetchTransactions = async () => {
      try {
        const { data: settingsData } = await fetchAPI("/v1/settings/disable_credits");
        const isEnabled = settingsData !== "true" && settingsData !== true;
        setEnableCredits(isEnabled);

        if (!isEnabled) {
          return;
        }

        const { data } = await fetchAPI<CreditTransaction[]>("/v1/payments/transactions");
        setTransactions(data || []);
      } catch (err) {
        setError((err as Error)?.message || "Error al cargar transacciones");
      }
    };
    checkSettingsAndFetchTransactions();
  }, [router]);

  const filtered = transactions.filter(t => {
    // Filtro por tipo (entrada/salida)
    if (typeFilter === 'in') return t.amount > 0;
    if (typeFilter === 'out') return t.amount < 0;
    if (typeFilter !== 'all') return false;
    
    // Filtro por estado
    if (statusFilter === 'completed') return t.payment_status === 'completed';
    if (statusFilter === 'pending') return t.payment_status === 'pending';
    if (statusFilter === 'failed') return t.payment_status === 'failed';
    
    // Todos
    return true;
  });

  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return <CreditCard fontSize="small" />;
      case 'bank':
        return <AccountBalance fontSize="small" />;
      default:
        return <Paid fontSize="small" />;
    }
  };

  if (enableCredits === null) return null;

  if (!enableCredits) {
    return (
      <Box sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4
      }}>
        <Typography variant="h6" color="text.secondary">
          Esta funcionalidad no está habilitada en este momento.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: { xs: 2, md: 4 },
      color: 'text.primary'
    }}>
      <Box sx={{ 
        maxWidth: "1200px", 
        mx: "auto",
        position: 'relative'
      }}>
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
              display: 'inline-block',
              letterSpacing: '-0.5px'
            }}
          >
            Historial de Transacciones
          </Typography>
        </motion.div>

        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
          <StyledTabs
            value={typeFilter}
            onChange={(e, newValue) => {
              setTypeFilter(newValue);
              setStatusFilter('all'); // Reset status filter when changing type
            }}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              padding: '4px',
              boxShadow: theme.shadows[1]
            }}
          >
            <Tab label="Todas" value="all" />
            <Tab label="Entradas" value="in" icon={<ArrowDownward fontSize="small" />} iconPosition="start" />
            <Tab label="Salidas" value="out" icon={<ArrowUpward fontSize="small" />} iconPosition="start" />
          </StyledTabs>

          <StyledTabs
            value={statusFilter}
            onChange={(e, newValue) => {
              setStatusFilter(newValue);
              setTypeFilter('all'); // Reset type filter when changing status
            }}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              padding: '4px',
              boxShadow: theme.shadows[1]
            }}
          >
            <Tab label="Todos estados" value="all" />
            <Tab label="Completadas" value="completed" icon={<CheckCircle fontSize="small" />} iconPosition="start" />
            <Tab label="Pendientes" value="pending" icon={<Pending fontSize="small" />} iconPosition="start" />
            <Tab label="Fallidas" value="failed" icon={<Error fontSize="small" />} iconPosition="start" />
          </StyledTabs>
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '24px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(222, 226, 230, 0.5)',
            boxShadow: theme.shadows[2]
          }}>
            <History sx={{ 
              fontSize: 48, 
              color: 'text.secondary', 
              mb: 2,
              opacity: 0.5
            }} />
            <Typography variant="h6" color="text.secondary">
              No hay transacciones registradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user ? 'Todas tus transacciones aparecerán aquí' : 'Las transacciones de créditos aparecerán aquí'}
            </Typography>
          </Box>
        ) : (
          <AnimatePresence>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
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
                  whileHover={{ scale: 1.02 }}
                >
                  <TransactionCard>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      mb: 2 
                    }}>
                      <Avatar
                        sx={{
                          bgcolor: t.amount > 0 ? 'success.main' : 'error.main',
                          color: 'white',
                          width: 48,
                          height: 48,
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        {t.amount > 0 ? <ArrowDownward /> : <ArrowUpward />}
                      </Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold"
                          noWrap
                          color="text.primary"
                        >
                          {t.transaction_type}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          mt: 0.5
                        }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            fontSize="0.75rem"
                          >
                            {new Date(t.timestamp).toLocaleString()}
                          </Typography>
                          <StatusChip 
                            label={t.payment_status} 
                            size="small"
                            color={
                              t.payment_status === 'completed' ? 'success' : 
                              t.payment_status === 'pending' ? 'warning' : 'error'
                            }
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Divider sx={{ 
                      mb: 2, 
                      borderColor: 'rgba(0,0,0,0.1)' 
                    }} />
                    <Typography
                      variant="h5"
                      color={t.amount > 0 ? "success.dark" : "error.dark"}
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {t.amount > 0 ? '+' : ''}{t.amount} créditos
                    </Typography>
                    {user && t.payment_amount && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 2
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary'
                        }}>
                          {getPaymentMethodIcon(t.payment_method)}
                          <Typography variant="body2">
                            ${t.payment_amount.toFixed(2)}
                          </Typography>
                        </Box>
                        {t.payment_method && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ ml: 0.5 }}
                          >
                            • {t.payment_method}
                          </Typography>
                        )}
                      </Box>
                    )}
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