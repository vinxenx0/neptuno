// frontend/src/app/transactions/page.tsx
// Página de historial y detalles de transacciones de créditos

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
  Tab,
  Divider,
  Card,
  Chip,
  Grid,
  CardContent
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
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
import FeatureDisabled from '@/components/ui/FeatureDisabled';
import { StyledTabs } from '@/components/ui/Styled';
import { CreditTransaction } from '@/lib/types';

const TransactionCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  fontWeight: 700,
  fontSize: '0.75rem',
  padding: '4px 12px',
  color: 'white',
  '&.MuiChip-colorSuccess': { background: theme.palette.success.main },
  '&.MuiChip-colorWarning': { background: theme.palette.warning.main },
  '&.MuiChip-colorError': { background: theme.palette.error.main },
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

  const getTransactionDetails = (t: CreditTransaction) => {
    const details = [];
    if (t.payment_method) details.push(`Método: ${t.payment_method}`);
    if (t.payment_amount) details.push(`Monto: $${t.payment_amount.toFixed(2)}`);
    return details.length > 0 ? details.join(' • ') : null;
  };

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

  return (
    <FeatureDisabled message="Esta funcionalidad no está habilitada en este momento." isEnabled={enableCredits}>
      <Box sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        py: 6,
        px: { xs: 2, sm: 4 },
      }}>
        <Card sx={{
          maxWidth: "1200px",
          mx: "auto",
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0, 0, 100, 0.1)",
        }}>
          <Box sx={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "white",
            p: 3,
            textAlign: "center"
          }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Historial de Transacciones
            </Typography>
            <Typography variant="subtitle1">
              Registro completo de movimientos de créditos
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <StyledTabs
                value={typeFilter}
                onChange={(e, newValue) => {
                  setTypeFilter(newValue);
                  setStatusFilter('all');
                }}
                variant="scrollable"
              >
                <Tab label="Todas" value="all" />
                <Tab label="Entradas" value="in" icon={<ArrowDownward />} />
                <Tab label="Salidas" value="out" icon={<ArrowUpward />} />
              </StyledTabs>

              <StyledTabs
                value={statusFilter}
                onChange={(e, newValue) => {
                  setStatusFilter(newValue);
                  setTypeFilter('all');
                }}
                variant="scrollable"
              >
                <Tab label="Todos estados" value="all" />
                <Tab label="Completadas" value="completed" icon={<CheckCircle />} />
                <Tab label="Pendientes" value="pending" icon={<Pending />} />
                <Tab label="Fallidas" value="failed" icon={<Error />} />
              </StyledTabs>
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                boxShadow: theme.shadows[2]
              }}>
                <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No hay transacciones registradas
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <AnimatePresence>
                  {filtered.map((t) => (
                    <Grid item xs={12} sm={6} lg={4} key={t.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TransactionCard>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Avatar sx={{
                                bgcolor: t.amount > 0 ? 'success.main' : 'error.main',
                                color: 'white',
                                width: 48,
                                height: 48,
                                boxShadow: theme.shadows[4]
                              }}>
                                {t.amount > 0 ? <ArrowDownward /> : <ArrowUpward />}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight={600}>
                                  {t.transaction_type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(t.timestamp).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body1" color="text.secondary">
                                Estado:
                              </Typography>
                              <StatusChip
                                label={t.payment_status}
                                color={
                                  t.payment_status === 'completed' ? 'success' :
                                  t.payment_status === 'pending' ? 'warning' : 'error'
                                }
                              />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body1" color="text.secondary">
                                Método:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {t.payment_method?.toLowerCase() === 'card' ? <CreditCard /> :
                                 t.payment_method?.toLowerCase() === 'bank' ? <AccountBalance /> : <Paid />}
                                <Typography variant="body1">
                                  {t.payment_method || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            <Typography variant="h4" sx={{
                              mt: 2,
                              textAlign: 'right',
                              color: t.amount > 0 ? 'success.main' : 'error.main',
                              fontWeight: 700
                            }}>
                              {t.amount > 0 ? '+' : ''}{t.amount} créditos
                            </Typography>
                          </CardContent>
                        </TransactionCard>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </FeatureDisabled>
  );
}