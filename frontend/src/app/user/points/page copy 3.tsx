// frontend/src/app/user/points/page.tsx
// frontend/src/app/user/points/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { GlassCard, GradientText, TimelineIcon, EmptyState } from "@/components/ui";
import { Box, Typography, Tabs, Tab, styled, Chip } from "@mui/material";

const TimelineItemContainer = styled(motion.div)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  position: "relative",
  paddingLeft: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  borderLeft: "2px solid rgba(255, 255, 255, 0.1)",
  "&:last-child": {
    borderLeft: "none",
    paddingBottom: 0,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: "-9px",
    top: 0,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: theme.palette.primary.main,
    boxShadow: `0 0 0 4px ${theme.palette.primary.dark}33`,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  "& .MuiTab-root": {
    color: theme.palette.common.white,
    opacity: 0.7,
    fontSize: "0.875rem",
    fontWeight: 500,
    textTransform: "capitalize",
    minWidth: "auto",
    padding: "6px 16px",
    "&.Mui-selected": {
      color: theme.palette.primary.main,
      opacity: 1,
    },
    "&:hover": {
      opacity: 1,
    },
  },
}));

const StyledGlassCard = styled(GlassCard)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.7)",
    backdropFilter: "blur(10px)",
    zIndex: 0,
  },
  "& > div": {
    position: "relative",
    zIndex: 1,
  },
}));

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
        const { data: settingsData } = await fetchAPI("/v1/settings/enable_points");
        const isEnabled = settingsData === "true" || settingsData === true;
        setEnablePoints(isEnabled);

        if (!isEnabled) {
          return;
        }

        const { data }: { data: any[] } = await fetchAPI("/v1/gamification/me");
        if (data) {
          setPointsHistory(Array.isArray(data) ? data : []);

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

  if (enablePoints === null) return null;

  if (!enablePoints) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
        py: { xs: 4, md: 8 },
        px: { xs: 2, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ mb: 6, textAlign: "center" }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              <GradientText>Historial de Puntos</GradientText>
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Tu progreso y logros en la plataforma
            </Typography>
          </Box>
        </motion.div>

        <StyledTabs
          value={selectedTab}
          onChange={(_, val) => setSelectedTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            mb: 4,
            "& .MuiTabs-scroller": {
              padding: "0 16px",
            }
          }}
        >
          <Tab label="Todos" value="all" />
          {eventTypes.map((type) => (
            <Tab 
              key={type} 
              label={type.replace(/_/g, " ")} 
              value={type} 
              icon={<TimelineIcon type={type} />}
              iconPosition="start"
            />
          ))}
        </StyledTabs>

        <StyledGlassCard sx={{ p: { xs: 4, md: 6 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              mb: 6,
              gap: 3,
            }}
          >
            <Box>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                Puntos Totales
              </Typography>
              <Typography variant="h3" sx={{ color: "primary.light", fontWeight: "bold" }}>
                {totalPoints}
              </Typography>
            </Box>
            {user && (
              <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Nivel Actual
                </Typography>
                <Chip
                  label="Experto"
                  color="primary"
                  sx={{ 
                    fontSize: "1rem",
                    fontWeight: "bold",
                    px: 2,
                    py: 1,
                  }}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ "& > * + *": { mt: 4 } }}>
            <AnimatePresence>
              {filteredPoints.map((entry, index) => (
                <TimelineItemContainer
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TimelineIcon type={entry.event_type.name} />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 2,
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6" sx={{ color: "white", fontWeight: "semibold" }}>
                        +{entry.points} puntos
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(entry.created_at).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 2 }}>
                      {entry.event_type.description}
                    </Typography>
                    <Chip
                      label={entry.event_type.name}
                      size="small"
                      sx={{ 
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    />
                  </Box>
                </TimelineItemContainer>
              ))}
            </AnimatePresence>

            {filteredPoints.length === 0 && (
              <EmptyState
                icon="📊"
                title="Aún no tienes puntos"
                description="Realiza actividades en la plataforma para ganar puntos"
              />
            )}
          </Box>
        </StyledGlassCard>
      </Box>
    </Box>
  );
}