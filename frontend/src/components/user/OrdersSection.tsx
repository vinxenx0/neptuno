import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, List, ListItem, ListItemText } from "@mui/material";
import { GlassCard } from "./StyledComponents";

export default function OrdersSection({ orders }) {
  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Historial de Compras</Typography>
        {orders.length === 0 ? (
          <Typography>No tienes compras registradas</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Orden</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Detalles</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.total_amount} créditos</TableCell>
                  <TableCell>
                    <List dense>
                      {order.items.map((item) => (
                        <ListItem key={item.id}>
                          <ListItemText
                            primary={item.product_name}
                            secondary={`Cant: ${item.quantity} - ${item.price} créditos c/u`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </TableCell>
                  <TableCell>
                    {order.items.some((item) => item.is_digital) && (
                      <Button
                        href={order.items.find((item) => item.is_digital)?.file_path}
                        download
                        disabled={!order.items.find((item) => item.is_digital)?.file_path}
                      >
                        Descargar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </GlassCard>
  );
}