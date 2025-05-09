// frontend/src/app/gamification/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Grid, CardContent } from "@mui/material";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { GradientCard, GlassCard } from "@/components/ui/Styled";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

interface GamificationKPIs {
  total_events: number;
  active_users: number;
  total_badges: number;
  total_points: number;
  rankings: { username: string; points: number; badges: number }[];
  badge_distribution: { name: string; count: number }[];
  event_distribution: { name: string; count: number }[];
}

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<GamificationKPIs | null>(null);
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
        const { data } = await fetchAPI<GamificationKPIs>("/v1/gamification/kpis");
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

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Gamification Dashboard</Typography>

      {/* Resumen General */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Eventos Registrados</Typography>
              <Typography variant="h4">{kpis?.total_events}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Usuarios Activos</Typography>
              <Typography variant="h4">{kpis?.active_users}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Badges Otorgados</Typography>
              <Typography variant="h4">{kpis?.total_badges}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Typography variant="h6">Puntos Totales</Typography>
              <Typography variant="h4">{kpis?.total_points}</Typography>
            </CardContent>
          </GradientCard>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6">Distribución de Badges</Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={kpis?.badge_distribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {kpis?.badge_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <Typography variant="h6">Actividad por Tipo de Evento</Typography>
              <BarChart width={400} height={300} data={kpis?.event_distribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}