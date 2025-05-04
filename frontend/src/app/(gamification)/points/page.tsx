// frontend/src/app/points/page.tsx
// Página de historial y progreso de puntos y gamificación
// frontend/src/app/points/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Avatar,
  useTheme,
  Card,
  CardContent,
  Grid,
  styled
} from "@mui/material";
import {
  GlassCard,
  GradientText,
  TimelineIcon,
  EmptyState
} from "@/components/ui";
import {
  EmojiEvents,
  Star,
  Timeline,
  CardGiftcard,
  Redeem
} from "@mui/icons-material";

const TimelineItemContainer = styled(motion.div)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(3),
  position: "relative",
  padding: theme.spacing(3),
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: theme.shadows[4]
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: 3,
  },
  "& .MuiTab-root": {
    color: theme.palette.text.secondary,
    opacity: 0.8,
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
      color: theme.palette.primary.main,
      opacity: 1,
    },
  },
}));

const StyledGlassCard = styled(GlassCard)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  "& > div": {
    position: "relative",
    zIndex: 1,
  },
}));

const PointsBadge = styled(Chip)(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "bold",
  padding: theme.spacing(1, 2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
}));

export default function PointsPage() {
  const theme = useTheme();
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
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
            <GradientText>Historial de Puntos</GradientText>
          </Typography>
          <Typography variant="subtitle1">
            Tu progreso y logros en la plataforma
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Tabs
            value={selectedTab}
            onChange={(_, val) => setSelectedTab(val)}
            variant="scrollable"
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': {
                height: 3,
                background: theme.palette.primary.main
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
                sx={{ minHeight: 48 }}
              />
            ))}
          </Tabs>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                borderRadius: 3,
                p: 3
              }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  Resumen de Puntos
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {totalPoints}
                  </Typography>
                  <Chip
                    label="Nivel Experto"
                    sx={{
                      mt: 2,
                      background: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                      fontWeight: 700
                    }}
                  />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <AnimatePresence>
                {filteredPoints.map((entry, index) => (
                  <TimelineItemContainer
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      width: 40,
                      height: 40
                    }}>
                      <TimelineIcon type={entry.event_type.name} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          +{entry.points} puntos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {entry.event_type.description}
                      </Typography>
                      <Chip
                        label={entry.event_type.name}
                        size="small"
                        sx={{ bgcolor: 'action.selected' }}
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}