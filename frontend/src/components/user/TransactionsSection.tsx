import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { GlassCard } from "./StyledComponents";

export default function TransactionsSection({ transactions, orders }) {
  const router = useRouter();

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Transacciones y Órdenes</Typography>
        <Typography variant="h6">Transacciones de Créditos</Typography>
        <List>
          {transactions.map((t) => (
            <ListItem key={t.id}>
              <ListItemText
                primary={t.transaction_type}
                secondary={`${new Date(t.timestamp).toLocaleString()} • ${t.payment_status} • ${t.amount} créditos`}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" sx={{ mt: 3 }}>Últimas Órdenes del Marketplace</Typography>
        <List>
          {orders.slice(0, 5).map((o) => (
            <ListItem key={o.id}>
              <ListItemText
                primary={`Orden #${o.id}`}
                secondary={`Total: ${o.total_amount} créditos • Estado: ${o.status} • ${new Date(o.created_at).toLocaleString()}`}
              />
              <Button href={`/marketplace/order/${o.id}`}>Ver Detalles</Button>
            </ListItem>
          ))}
        </List>
        <Button onClick={() => router.push('/user/orders')} sx={{ mt: 2 }}>Ver Todas las Órdenes</Button>
      </Box>
    </GlassCard>
  );
}