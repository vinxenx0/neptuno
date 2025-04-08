// frontend/src/app/user/points/page.tsx
// frontend/src/app/user/points/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { GlassCard, GradientText, TimelineIcon, EmptyState } from "@/components/ui";
import { Box, Typography, Tabs, Tab } from "@mui/material";

const TimelineItem = ({ entry }: { entry: any }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex gap-4 relative pl-8 pb-6 border-l-2 border-white/10 last:border-0"
  >
    <div className="absolute left-[-9px] top-0 w-4 h-4 bg-purple-500 rounded-full" />
    <TimelineIcon type={entry.event_type.name} className="flex-shrink-0 mt-1" />
    <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-white">
          +{entry.points} puntos
        </span>
        <span className="text-sm text-gray-400">
          {new Date(entry.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <p className="text-gray-300">{entry.event_type.description}</p>
      <span className="inline-block mt-2 px-2 py-1 bg-white/10 rounded-full text-sm">
        {entry.event_type.name}
      </span>
    </div>
  </motion.div>
);

export default function PointsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [enablePoints, setEnablePoints] = useState<boolean | null>(null);
  const [groupedPoints, setGroupedPoints] = useState<Record<string, any[]>>({});
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    const checkSettingsAndFetchPoints = async () => {
      try {
        // Verificar si el módulo de puntos está habilitado
        const { data: settingsData } = await fetchAPI("/v1/settings/enable_points");
        const isEnabled = settingsData === "true" || settingsData === true;
        setEnablePoints(isEnabled);

        if (!isEnabled) {
          return; // Si no está habilitado, no cargamos datos
        }

        // Cargar el historial de puntos si el módulo está habilitado
        const { data }: { data: any[] } = await fetchAPI("/v1/gamification/me");
        if (data) {
          setPointsHistory(Array.isArray(data) ? data : []);

          // Agrupar puntos por tipo de evento
          const grouped = data.reduce((acc, entry) => {
            const key = entry.event_type.name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(entry);
            return acc;
          }, {} as Record<string, any[]>);

          setGroupedPoints(grouped);
        }
      } catch (err) {
        console.error("Error al obtener historial de puntos:", err);
      }
    };
    checkSettingsAndFetchPoints();
  }, [router]);

  if (enablePoints === null) return null; // Mientras se carga la configuración

  if (!enablePoints) {
    return (
      <Box
        className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 8,
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Esta funcionalidad no está habilitada en este momento.
        </Typography>
      </Box>
    );
  }

  const eventTypes = Object.keys(groupedPoints);
  const filteredPoints = selectedTab === "all" ? pointsHistory : groupedPoints[selectedTab] || [];
  const totalPoints = pointsHistory.reduce((sum, entry) => sum + entry.points, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          <GradientText>Historial de Puntos</GradientText>
        </h1>

        <Tabs
          value={selectedTab}
          onChange={(_, val) => setSelectedTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 4 }}
        >
          <Tab label="Todos" value="all" />
          {eventTypes.map((type) => (
            <Tab key={type} label={type.replace(/_/g, " ")} value={type} />
          ))}
        </Tabs>

        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-white">Puntos Totales</h2>
              <p className="text-4xl font-bold text-purple-400">
                {totalPoints}
              </p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-300">Nivel Actual</p>
                <div className="text-2xl font-bold text-white">Experto</div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {filteredPoints.map((entry, index) => (
                <TimelineItem key={index} entry={entry} />
              ))}
            </AnimatePresence>

            {filteredPoints.length === 0 && (
              <EmptyState
                icon="📊"
                title="Aún no tienes puntos"
                description="Realiza actividades en la plataforma para ganar puntos"
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}