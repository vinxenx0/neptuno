// frontend/src/app/coupon/page.tsx
// Página de gestión y canjeo de cupones del usuario

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  styled,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import {
  LocalOffer,
  CheckCircle,
  Pending,
  ErrorOutline,
  Block,
  Redeem
} from "@mui/icons-material";

// Styled Components
const CouponCard = styled(Paper)(({ theme }) => ({
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

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.75rem',
  padding: '4px 12px',
  color: 'white',
  '&.MuiChip-colorSuccess': { background: theme.palette.success.main },
  '&.MuiChip-colorWarning': { background: theme.palette.warning.main },
  '&.MuiChip-colorError': { background: theme.palette.error.main },
  '&.MuiChip-colorDefault': { background: theme.palette.grey[500] }
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

export default function CouponPage() {
  const { coupons, setCoupons, setCredits } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableCoupons, setEnableCoupons] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    if (!coupons) router.push("/");
  }, [coupons, router]);

  const handleRedeem = async (couponId: number) => {
    try {
      const { data } = await fetchAPI<any>(`/v1/coupons/redeem/${couponId}`, {
        method: "POST",
      });
      if (data) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data : c)));
        const { data: info } = await fetchAPI<any>("/whoami");
        setCredits(info.credits);
        setSuccess("Cupón canjeado exitosamente");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al canjear cupón");
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (statusFilter === 'all') return true;
    return coupon.status === statusFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle fontSize="small" />;
      case 'pending': return <Pending fontSize="small" />;
      case 'expired': return <ErrorOutline fontSize="small" />;
      case 'disabled': return <Block fontSize="small" />;
      case 'redeemed': return <Redeem fontSize="small" />;
      default: return <LocalOffer fontSize="small" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'redeemed': return 'primary';
      case 'expired':
      case 'disabled': 
      default: return 'error';
    }
  };

  //if (enableCoupons === null) return null;

 /* if (!enableCoupons) {
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
*/
return (
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
          Mis Cupones
        </Typography>
        <Typography variant="subtitle1">
          Gestiona y canjea tus cupones disponibles
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
        <Tabs
          value={statusFilter}
          onChange={(_, val) => setStatusFilter(val)}
          variant="scrollable"
          sx={{
            mb: 4,
            '& .MuiTabs-indicator': {
              height: 3,
              background: theme.palette.primary.main
            }
          }}
        >
          <Tab label="Activos" value="active" icon={<CheckCircle />} />
          <Tab label="Canjeados" value="redeemed" icon={<Redeem />} />
          <Tab label="Pendientes" value="pending" icon={<Pending />} />
          <Tab label="Expirados" value="expired" icon={<ErrorOutline />} />
          <Tab label="Desactivados" value="disabled" icon={<Block />} />
        </Tabs>

        <Grid container spacing={3}>
          {filteredCoupons.map((coupon) => (
            <Grid item xs={12} sm={6} md={4} key={coupon.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: theme.shadows[4],
                  transition: 'all 0.3s ease',
                  '&:hover': { boxShadow: theme.shadows[6] }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      width: 48,
                      height: 48,
                      boxShadow: theme.shadows[2]
                    }}>
                      {getStatusIcon(coupon.status)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {coupon.name}
                      </Typography>
                      <StatusChip 
                        label={coupon.status} 
                        color={getStatusColor(coupon.status)}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'divider' }} />

                  <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    {coupon.description || "Descripción no disponible"}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Typography variant="h5" color="primary.main" fontWeight={700}>
                      {coupon.credits} créditos
                    </Typography>
                    {coupon.status === 'active' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleRedeem(coupon.id)}
                        startIcon={<Redeem />}
                        sx={{ borderRadius: 2 }}
                      >
                        Canjear
                      </Button>
                    )}
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {filteredCoupons.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 3
          }}>
            <LocalOffer sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No hay cupones disponibles
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}