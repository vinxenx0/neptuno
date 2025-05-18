// frontemd/src/components/admin/LogsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Skeleton,
  Pagination,
  Snackbar,
  Alert,
  Typography,
  Avatar,
  Chip,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Error as ErrorIcon,
  ListAlt,
  People,
  CreditCard,
  Warning,
  Api,
  Person,
  Receipt,
  CreditScore,
  DeleteSweep,
  LocalActivity,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Styled Components
const AdminGlassCard = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "16px",
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: theme.shadows[2],
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: "12px 12px 0 0",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "& .MuiDataGrid-row:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: "bold",
  borderRadius: "8px",
}));

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
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

interface CouponActivity {
  id: number;
  coupon_type: string;
  unique_identifier: string;
  user_id?: number;
  session_id?: string;
  status: string;
  issued_at: string;
  redeemed_at?: string;
}

export default function LogsSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("errors");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = `/v1/${activeTab}?page=${page}&limit=${limit}`;
        if (activeTab === "coupons") endpoint = `/v1/coupons/activity`;
        const response = await fetchAPI<{
          data: any[];
          total_items: number;
          total_pages: number;
          current_page: number;
        }>(endpoint);

        if (response.error) throw new Error(typeof response.error === "string" ? response.error : "Error desconocido");

        setData(response.data?.data || []);
        setTotalPages(response.data?.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Error al cargar ${activeTab}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, activeTab, page]);

  const safeValueGetter: GridColDef["valueGetter"] = (value: any) => value ?? "N/A";
  const safeDateFormatter: GridColDef["valueGetter"] = (value: any) =>
    value ? new Date(value as string).toLocaleString() : "N/A";

  const getStatusChip = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return <StatusChip label={statusCode} color="success" size="small" />;
    if (statusCode >= 400 && statusCode < 500) return <StatusChip label={statusCode} color="warning" size="small" />;
    if (statusCode >= 500) return <StatusChip label={statusCode} color="error" size="small" />;
    return <StatusChip label={statusCode} color="info" size="small" />;
  };

  const getErrorSeverity = (errorCode: number) => {
    if (errorCode >= 500) return "error";
    if (errorCode >= 400) return "warning";
    return "info";
  };

  const getColumns = (): GridColDef[] => {
    switch (activeTab) {
      case "errors":
        return [
          {
            field: "id",
            headerName: "ID",
            width: 90,
            renderCell: (params) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Warning color={getErrorSeverity(params.row.error_code)} />
                {params.value}
              </Box>
            ),
          },
          {
            field: "user_id",
            headerName: "Usuario",
            width: 120,
            valueGetter: safeValueGetter,
            renderCell: (params) => (
              params.value ? (
                <Chip
                  avatar={<Avatar sx={{ width: 24, height: 24 }}><Person sx={{ fontSize: 14 }} /></Avatar>}
                  label={`ID: ${params.value}`}
                  size="small"
                />
              ) : (
                <Typography variant="body2">N/A</Typography>
              )
            ),
          },
          {
            field: "error_code",
            headerName: "Código",
            width: 120,
            renderCell: (params) => (
              <StatusChip
                label={params.value}
                color={getErrorSeverity(params.value)}
                size="small"
              />
            ),
          },
          {
            field: "message",
            headerName: "Mensaje",
            width: 200,
            renderCell: (params) => (
              <Typography variant="body2" noWrap>
                {params.value}
              </Typography>
            ),
          },
          {
            field: "method",
            headerName: "Método",
            width: 100,
            valueGetter: safeValueGetter,
            renderCell: (params) => (
              <Chip
                label={params.value}
                size="small"
                color="primary"
                variant="outlined"
              />
            ),
          },
          {
            field: "created_at",
            headerName: "Fecha",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      case "logs":
        return [
          { field: "id", headerName: "ID", width: 90 },
          {
            field: "user_id",
            headerName: "Usuario",
            width: 120,
            valueGetter: safeValueGetter,
            renderCell: (params) => (
              params.value ? (
                <Chip
                  avatar={<Avatar sx={{ width: 24, height: 24 }}><Person sx={{ fontSize: 14 }} /></Avatar>}
                  label={`ID: ${params.value}`}
                  size="small"
                />
              ) : (
                <Typography variant="body2">N/A</Typography>
              )
            ),
          },
          {
            field: "endpoint",
            headerName: "Endpoint",
            width: 200,
            renderCell: (params) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Api color="primary" sx={{ fontSize: 16 }} />
                <Typography variant="body2" noWrap>
                  {params.value}
                </Typography>
              </Box>
            ),
          },
          {
            field: "method",
            headerName: "Método",
            width: 100,
            renderCell: (params) => (
              <Chip
                label={params.value}
                size="small"
                color="primary"
                variant="outlined"
              />
            ),
          },
          {
            field: "status_code",
            headerName: "Estado",
            width: 120,
            renderCell: (params) => getStatusChip(params.value),
          },
          {
            field: "timestamp",
            headerName: "Fecha",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      case "sessions":
        return [
          {
            field: "id",
            headerName: "ID Sesión",
            width: 150,
            renderCell: (params) => (
              <Typography variant="body2" fontFamily="monospace">
                {params.value}
              </Typography>
            ),
          },
          {
            field: "credits",
            headerName: "Créditos",
            width: 120,
            renderCell: (params) => (
              <Chip
                label={params.value}
                color="primary"
                size="small"
                avatar={<CreditScore sx={{ fontSize: 16 }} />}
              />
            ),
          },
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
            valueGetter: safeValueGetter,
            renderCell: (params) => (
              <Typography variant="body2" fontFamily="monospace">
                {params.value}
              </Typography>
            ),
          },
        ];
      case "transactions":
        return [
          { field: "id", headerName: "ID", width: 90 },
          {
            field: "user_id",
            headerName: "Usuario",
            width: 120,
            valueGetter: safeValueGetter,
            renderCell: (params) => (
              params.value ? (
                <Chip
                  avatar={<Avatar sx={{ width: 24, height: 24 }}><Person sx={{ fontSize: 14 }} /></Avatar>}
                  label={`ID: ${params.value}`}
                  size="small"
                />
              ) : (
                <Typography variant="body2">N/A</Typography>
              )
            ),
          },
          {
            field: "amount",
            headerName: "Cantidad",
            width: 120,
            renderCell: (params) => (
              <Chip
                label={params.value}
                color={params.value > 0 ? "success" : "error"}
                size="small"
                avatar={<Receipt sx={{ fontSize: 16 }} />}
              />
            ),
          },
          {
            field: "transaction_type",
            headerName: "Tipo",
            width: 150,
            renderCell: (params) => (
              <Chip
                label={params.value}
                color="info"
                size="small"
                variant="outlined"
              />
            ),
          },
          {
            field: "payment_amount",
            headerName: "Monto",
            width: 130,
            valueGetter: (value: any) => (value ? `$${(value as number).toFixed(2)}` : "N/A"),
          },
          {
            field: "payment_status",
            headerName: "Estado",
            width: 120,
            renderCell: (params) => (
              <StatusChip
                label={params.value}
                color={params.value === "completed" ? "success" : "warning"}
                size="small"
              />
            ),
          },
          {
            field: "timestamp",
            headerName: "Fecha",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      case "coupons":
        return [
          { field: "id", headerName: "ID", width: 90 },
          { field: "coupon_type", headerName: "Tipo", width: 150 },
          { field: "unique_identifier", headerName: "Identificador", width: 200 },
          {
            field: "user_id",
            headerName: "Usuario",
            width: 120,
            valueGetter: safeValueGetter,
          },
          {
            field: "session_id",
            headerName: "Sesión",
            width: 150,
            valueGetter: safeValueGetter,
          },
          {
            field: "status",
            headerName: "Estado",
            width: 120,
            renderCell: (params) => (
              <StatusChip
                label={params.value}
                color={params.value === "active" ? "success" : "error"}
                size="small"
              />
            ),
          },
          {
            field: "issued_at",
            headerName: "Emitido",
            width: 180,
            valueGetter: safeDateFormatter,
          },
          {
            field: "redeemed_at",
            headerName: "Canjeado",
            width: 180,
            valueGetter: safeDateFormatter,
          },
        ];
      default:
        return [];
    }
  };

  const handleClearLogs = async () => {
    try {
      let endpoint = "";
      switch (activeTab) {
        case "logs":
          endpoint = "/v1/logs/clear";
          break;
        case "sessions":
          endpoint = "/v1/guests/clear";
          break;
        case "coupons":
          endpoint = "/v1/coupons/clear";
          break;
        case "errors":
          endpoint = "/v1/errors/clear";
          break;
        default:
          setError("No hay logs para vaciar en esta pestaña");
          return;
      }
      await fetchAPI(endpoint, { method: "DELETE" });
      setSuccess("Logs vaciados con éxito");
      setData([]); // Limpiar datos localmente
      setPage(1);  // Reiniciar paginación
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al vaciar logs");
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "errors":
        return <ErrorIcon />;
      case "logs":
        return <ListAlt />;
      case "sessions":
        return <People />;
      case "transactions":
        return <CreditCard />;
      case "coupons":
        return <LocalActivity />;
      default:
        return <ListAlt />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
    );
  }

  return (
    <AdminGlassCard>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<DeleteSweep />}
          onClick={handleClearLogs}
          disabled={activeTab === "transactions"}
        >
          Vaciar Logs
        </Button>
      </Box>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,
          "& .MuiTab-root": {
            minHeight: 64,
            fontSize: "1rem",
            fontWeight: "bold",
          },
        }}
      >
        {["errors", "logs", "sessions", "transactions", "coupons"].map((tab) => (
          <Tab
            key={tab}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getTabIcon(tab)}
                {tab === "errors" && "Errores"}
                {tab === "logs" && "Logs API"}
                {tab === "sessions" && "Sesiones"}
                {tab === "transactions" && "Transacciones"}
                {tab === "coupons" && "Cupones"}
              </Box>
            }
            value={tab}
          />
        ))}
      </Tabs>
      <StyledDataGrid
        rows={data}
        columns={getColumns()}
        pageSizeOptions={[limit]}
        disableRowSelectionOnClick
        autoHeight
        getRowId={(row) => row.id || Math.random().toString(36).substring(2, 9)}
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => setPage(model.page + 1)}
        rowCount={totalPages * limit}
        paginationMode="server"
        sx={{ "& .MuiDataGrid-cell": { display: "flex", alignItems: "center" } }}
      />
      <Pagination
        count={totalPages}
        page={page}
        onChange={(e, value) => setPage(value)}
        color="primary"
        sx={{ mt: 3, display: "flex", justifyContent: "center" }}
      />
      {success && (
        <Snackbar open autoHideDuration={3000} onClose={() => setSuccess(null)}>
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        </Snackbar>
      )}
      {error && (
        <Snackbar open autoHideDuration={3000} onClose={() => setError(null)}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </AdminGlassCard>
  );
}