// src/app/admin/registry/page.tsx
// src/app/admin/registry/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Paper, Tabs, Tab, Skeleton, Pagination, Snackbar, Alert, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetter } from "@mui/x-data-grid";

// Interfaces de datos
interface ErrorLog {
  id: number;
  user_id?: number;
  session_id?: string;
  error_code: number;
  message: string;
  details?: string;
  url?: string;
  method?: string;
  ip_address?: string;
  created_at: string;
}

interface APILog {
  id: number;
  user_id?: number;
  endpoint: string;
  method: string;
  status_code: number;
  request_data?: string;
  response_data?: string;
  timestamp: string;
}

interface GuestsSession {
  id: string;
  credits: number;
  create_at: string;
  ultima_actividad?: string;
  last_ip?: string;
}

interface CreditTransaction {
  id: number;
  user_id?: number;
  session_id?: string;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

const TabContent = ({ tab }: { tab: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/user/auth/#login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = `/v1/${tab}?page=${page}&limit=${limit}`;
        const response = await fetchAPI<{
          data: any[];
          total_items: number;
          total_pages: number;
          current_page: number;
        }>(endpoint);

        if (response.error) throw new Error(typeof response.error === 'string' ? response.error : 'Error desconocido');

        setData(response.data?.data || []);
        setTotalPages(response.data?.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Error al cargar ${tab}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, tab, page]);
  // Función segura para valueGetter con tipado correcto
  const safeValueGetter: GridColDef['valueGetter'] = (value: any) => {
    return value ?? "N/A";
  };

  // Función segura para formatear fechas con tipado correcto
  const safeDateFormatter: GridColDef['valueGetter'] = (value: any) => {
    try {
      return value ? new Date(value as string).toLocaleString() : "N/A";
    } catch {
      return "N/A";
    }
  };

  const getColumns = (): GridColDef[] => {
    switch (tab) {
      case "errors":
        return [
          { field: "id", headerName: "ID", width: 90 },
          {
            field: "user_id",
            headerName: "User ID",
            width: 120,
            valueGetter: safeValueGetter
          },
          {
            field: "session_id",
            headerName: "Session ID",
            width: 150,
            valueGetter: safeValueGetter
          },
          { field: "error_code", headerName: "Error Code", width: 120 },
          { field: "message", headerName: "Message", width: 200 },
          {
            field: "url",
            headerName: "URL",
            width: 150,
            valueGetter: safeValueGetter
          },
          {
            field: "method",
            headerName: "Method",
            width: 100,
            valueGetter: safeValueGetter
          },
          {
            field: "ip_address",
            headerName: "IP Address",
            width: 130,
            valueGetter: safeValueGetter
          },
          {
            field: "created_at",
            headerName: "Created At",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      case "logs":
        return [
          { field: "id", headerName: "ID", width: 90 },
          {
            field: "user_id",
            headerName: "User ID",
            width: 120,
            valueGetter: safeValueGetter
          },
          { field: "endpoint", headerName: "Endpoint", width: 200 },
          { field: "method", headerName: "Method", width: 100 },
          { field: "status_code", headerName: "Status Code", width: 120 },
          {
            field: "timestamp",
            headerName: "Timestamp",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      case "sessions":
        return [
          { field: "id", headerName: "ID", width: 150 },
          { field: "credits", headerName: "Créditos", width: 120 },
          {
            field: "create_at",
            headerName: "Creado",
            width: 180,
            valueGetter: safeDateFormatter,
          },
          {
            field: "ultima_actividad",
            headerName: "Última Actividad",
            width: 180,
            valueGetter: safeDateFormatter,
          },
          {
            field: "last_ip",
            headerName: "Última IP",
            width: 130,
            valueGetter: safeValueGetter
          },
        ];
      case "transactions":
        return [
          { field: "id", headerName: "ID", width: 90 },
          {
            field: "user_id",
            headerName: "User ID",
            width: 120,
            valueGetter: safeValueGetter
          },
          {
            field: "session_id",
            headerName: "Session ID",
            width: 150,
            valueGetter: safeValueGetter
          },
          { field: "amount", headerName: "Cantidad", width: 120 },
          { field: "transaction_type", headerName: "Tipo", width: 150 },
          {
            field: "payment_amount",
            headerName: "Monto Pago",
            width: 130,
            valueGetter: (value: any) =>
              value ? (value as number).toFixed(2) : "N/A",
          },
          {
            field: "payment_method",
            headerName: "Método Pago",
            width: 150,
            valueGetter: safeValueGetter
          },
          { field: "payment_status", headerName: "Estado", width: 120 },
          {
            field: "timestamp",
            headerName: "Fecha",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    );
  }

  return (
    <Box>
      <DataGrid
        rows={data}
        columns={getColumns()}
        pageSizeOptions={[limit]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ borderRadius: 2, boxShadow: 2 }}
        getRowId={(row) => row.id || Math.random().toString(36).substring(2, 9)}
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => setPage(model.page + 1)}
        rowCount={totalPages * limit}
        paginationMode="server"
      />
      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, value) => setPage(value)}
        color="primary"
        sx={{ mt: 2, display: "flex", justifyContent: "center" }}
      />
    </Box>
  );
};

export default function RegistryPage() {
  const [activeTab, setActiveTab] = useState("errors");

  return (
    <Box sx={{ p: 6, minHeight: "100vh" }} className="container mx-auto">
      <Typography
        component={motion.h1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          fontSize: "2rem",
          fontWeight: "bold",
          mb: 6,
          textAlign: "center"
        }}
      >
        Registro de Administración
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
          sx={{ mb: 4 }}
        >
          <Tab label="Error Logs" value="errors" />
          <Tab label="API Logs" value="logs" />
          <Tab label="Sesiones" value="sessions" />
          <Tab label="Transacciones" value="transactions" />
        </Tabs>
        <Suspense fallback={<Skeleton variant="rectangular" height={400} />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabContent tab={activeTab} />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </Paper>
    </Box>
  );
}