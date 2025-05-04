// src/app/badges/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Avatar,
  useTheme,
  Tabs,
  Tab,
  Card,
  CardContent,
  styled,
  Paper
} from "@mui/material";
import {
  GlassCard,
  GradientText,
  BadgeIcon,
  EmptyState,
} from "@/components/ui";
import fetchAPI from "@/lib/api";
import { EmojiEvents, Stars } from "@mui/icons-material";
import { BadgeWithEventType, UserGamificationResponse } from "@/lib/types";

const BadgeCard = styled(motion.div)(({ theme }) => ({
  height: "100%",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6]
  }
}));

// Styled Components - Actualizados para mejor legibilidad
const BadgeContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: "1fr",
    padding: theme.spacing(2),
  },
}));

const EventTypeSection = styled("section")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: theme.palette.primary.main,
    height: 3,
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
      opacity: 1,
      color: theme.palette.primary.main,
    },
  },
}));

export default function Badges() {
  const theme = useTheme();
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeWithEventType[]>([]);
  const [groupedBadges, setGroupedBadges] = useState<Record<string, BadgeWithEventType[]>>({});
  const [selectedTab, setSelectedTab] = useState("all");
  const [enableBadges, setEnableBadges] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSettingsAndFetchBadges = async () => {
      try {
        const { data: settingsData } = await fetchAPI("/v1/settings/enable_badges");
        const isEnabled = settingsData === "true" || settingsData === true;
        setEnableBadges(isEnabled);

        if (!isEnabled) {
          return;
        }

        const { data } = await fetchAPI<UserGamificationResponse[]>("/v1/gamification/me");
        if (data) {
          const userBadges = data
            .filter((g) => g.badge)
            .map((g) => ({
              ...g.badge!,
              event_type: g.event_type,
            })) as BadgeWithEventType[];

          setBadges(userBadges);

          const grouped = userBadges.reduce((acc, badge) => {
            const key = badge.event_type.name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(badge);
            return acc;
          }, {} as Record<string, BadgeWithEventType[]>);

          setGroupedBadges(grouped);
        }
      } catch (err) {
        console.error("Error al cargar datos de insignias:", err);
      }
    };
    checkSettingsAndFetchBadges();
  }, [router]);

  if (enableBadges === null) return null;

  if (!enableBadges) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 6 },
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Esta funcionalidad no está habilitada en este momento.
        </Typography>
      </Box>
    );
  }

  const eventTypes = Object.keys(groupedBadges);
  const filteredBadges = selectedTab === "all" ? badges : groupedBadges[selectedTab] || [];

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      py: 6,
      px: { xs: 2, sm: 4 },
    }}>
      <Card sx={{
        maxWidth: "1600px",
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
            <GradientText>Mis Logros</GradientText>
          </Typography>
          <Typography variant="subtitle1">
            Tus insignias de reconocimiento
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
                icon={<BadgeIcon type={type} />}
                sx={{ minHeight: 48 }}
              />
            ))}
          </Tabs>

          <Grid container spacing={3}>
            {filteredBadges.map((badge) => (
              <Grid item xs={12} sm={6} md={4} key={badge.id}>
                <BadgeCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                      <Avatar sx={{
                        width: 56,
                        height: 56,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }}>
                        <BadgeIcon type={badge.event_type.name} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {badge.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {badge.event_type.name.replace(/_/g, " ")}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 3 }}>
                      {badge.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Chip
                        label={`${badge.required_points} pts`}
                        color="primary"
                        size="small"
                        icon={<Stars />}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {badge.user_type}
                      </Typography>
                    </Box>
                  </Box>
                </BadgeCard>
              </Grid>
            ))}
          </Grid>

          {filteredBadges.length === 0 && (
            <EmptyState
              icon="🎖️"
              title="Aún no tienes insignias"
              description="Completa acciones en la plataforma para desbloquear logros"
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}