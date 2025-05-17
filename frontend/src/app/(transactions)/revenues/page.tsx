// frontend/src/app/revenues/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Grid, CardContent } from "@mui/material";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { GradientCard, GlassCard } from "@/components/ui/Styled";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface SaaSKPIs {
  total_users: number;
  active_users_30d: number;
  new_users_month: number;
  paying_users: number;
  mrr: number;
  arr: number;
  total_revenue: number;
  arpu: number;
  ltv: number;
  churn_rate: number;
  churned_users: number;
  conversion_rate: number;
  total_credits: number;
  credits_used: number;
  dau: number;
  wau: number;
  mau: number;
}

export default function RevenuesDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<SaaSKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      if (user?.rol !== "admin") {
        setError("No autorizado");
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchAPI<SaaSKPIs>("/v1/transactions/kpis");
        setKpis(data);
      } catch (err) {
        setError("Error al cargar los KPIs");
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, [user]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  const usageData = [
    { name: "DAU", value: kpis?.dau },
    { name: "WAU", value: kpis?.wau },
    { name: "MAU", value: kpis?.mau }
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Revenues Dashboard</Typography>

      {/* Resumen General */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Usuarios Totales</Typography>
              <Typography variant="h4">{kpis?.total_users}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Usuarios Activos</Typography>
              <Typography variant="h4">{kpis?.active_users_30d}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">MRR</Typography>
              <Typography variant="h4">${kpis?.mrr}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">ARR</Typography>
              <Typography variant="h4">${kpis?.arr}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6">Uso (DAU/WAU/MAU)</Typography>
              <LineChart width={400} height={300} data={usageData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6">Churn Rate</Typography>
              <Typography variant="h4">{(kpis?.churn_rate * 100).toFixed(2)}%</Typography>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}