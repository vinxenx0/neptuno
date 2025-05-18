import { useTheme } from "@mui/material";
import {
  Box,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  AttachMoney,
  History,
  Payment,
  Star,
  CreditCard,
  Security,
} from "@mui/icons-material";
import { GradientCard, GlassCard } from "./StyledComponents";
import { User, CreditTransaction, PaymentMethod, Order } from "@/lib/types";

interface HomeSectionProps {
  user: User;
  transactions: CreditTransaction[];
  methods: PaymentMethod[];
  orders: Order[];
  setSelectedSection: (section: string) => void;
}

export default function HomeSection({
  user,
  transactions,
  methods,
  orders,
  setSelectedSection,
}: HomeSectionProps) {
  const theme = useTheme();

  return (
    <Box>
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Credits Card */}
          <Grid item xs={12} md={4}>
            <GradientCard>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>
                      Tus Créditos
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                      {user.credits ?? 0}
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </Box>
            </GradientCard>
          </Grid>

          {/* Transactions Card */}
          <Grid item xs={12} md={4}>
            <GradientCard
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>
                      Transacciones
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                      {transactions.length}
                    </Typography>
                  </Box>
                  <History sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </Box>
            </GradientCard>
          </Grid>

          {/* Payment Methods Card */}
          <Grid item xs={12} md={4}>
            <GradientCard
              sx={{
                background: "linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)",
              }}
            >
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>
                      Métodos de Pago
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>
                      {methods.length}
                    </Typography>
                  </Box>
                  <Payment sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </Box>
            </GradientCard>
          </Grid>
        </Grid>
      </motion.div>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Actividad Reciente
              </Typography>
              {transactions.slice(0, 3).length > 0 ? (
                <List>
                  {transactions.slice(0, 3).map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor:
                                t.amount > 0
                                  ? theme.palette.success.light
                                  : theme.palette.error.light,
                            }}
                          >
                            {t.amount > 0 ? "+" : "-"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${t.transaction_type}`}
                          secondary={`${new Date(t.timestamp).toLocaleString()} • ${
                            t.payment_status
                          }`}
                        />
                        <Typography
                          variant="body2"
                          color={t.amount > 0 ? "success.main" : "error.main"}
                        >
                          {t.amount > 0 ? "+" : ""}
                          {t.amount} créditos
                        </Typography>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </motion.div>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No hay actividad reciente
                </Typography>
              )}
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setSelectedSection("Transactions")}
              >
                Ver todas las transacciones
              </Button>
            </Box>
          </GlassCard>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Métodos de Pago Configurados
              </Typography>
              {methods.length > 0 ? (
                <List>
                  {methods.slice(0, 2).map((m) => (
                    <ListItem key={m.id}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: m.is_default
                              ? theme.palette.success.light
                              : theme.palette.grey[300],
                          }}
                        >
                          {m.is_default ? <Star /> : <CreditCard />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={m.payment_type} secondary={m.details} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No hay métodos de pago configurados
                </Typography>
              )}
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setSelectedSection("Payment Methods")}
              >
                {methods.length > 0 ? "Gestionar métodos" : "Añadir método"}
              </Button>
            </Box>
          </GlassCard>
        </Grid>

        {/* Last Marketplace Orders */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Últimas Órdenes del Marketplace
              </Typography>
              {orders.slice(0, 3).length > 0 ? (
                <List>
                  {orders.slice(0, 3).map((o) => (
                    <ListItem key={o.id}>
                      <ListItemText
                        primary={`Orden #${o.id}`}
                        secondary={`Total: ${o.total_amount} créditos • Estado: ${o.status} • ${new Date(
                          o.created_at
                        ).toLocaleString()}`}
                      />
                      <Button href={`/marketplace/order/${o.id}`}>
                        Ver Detalles
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No hay órdenes recientes
                </Typography>
              )}
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setSelectedSection("Orders")}
              >
                Ver todas las órdenes
              </Button>
            </Box>
          </GlassCard>
        </Grid>

        {/* Rates and Benefits */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Tarifas y Beneficios
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                      <Star />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="1 crédito = $1 USD"
                    secondary="Tasa de cambio fija"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                      <Payment />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Múltiples métodos de pago"
                    secondary="Tarjetas, PayPal y más"
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                      <Security />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Transacciones seguras"
                    secondary="Encriptación SSL"
                  />
                </ListItem>
              </List>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setSelectedSection("Buy Credits")}
              >
                Comprar Créditos
              </Button>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}