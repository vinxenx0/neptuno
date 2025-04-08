// src/app/user/gamification/badges/page.tsx
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
  styled,
  Tabs,
  Tab,
  Fade,
} from "@mui/material";
import {
  GlassCard,
  GradientText,
  BadgeIcon,
  EmptyState,
} from "@/components/ui";
import fetchAPI from "@/lib/api";
import { UserGamificationResponse, BadgeWithEventType } from "@/lib/types";
import { EmojiEvents, Stars } from "@mui/icons-material";

const BadgeContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: theme.spacing(4),
  padding: theme.spacing(4),
}));

const BadgeCard = styled(GlassCard)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

const EventTypeSection = styled("section")(({ theme }) => ({
  marginBottom: theme.spacing(6),
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
        // Verificar si el módulo de insignias está habilitado
        const { data: settingsData } = await fetchAPI("/v1/settings/enable_badges");
        const isEnabled = settingsData === "true" || settingsData === true;
        setEnableBadges(isEnabled);

        if (!isEnabled) {
          return; // Si no está habilitado, no cargamos datos
        }

        // Cargar las insignias si el módulo está habilitado
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

  if (enableBadges === null) return null; // Mientras se carga la configuración

  if (!enableBadges) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 6 },
          px: { xs: 2, md: 6 },
        }}
      >
        <Typography variant="h6" color="textSecondary">
          Esta funcionalidad no está habilitada en este momento.
        </Typography>
      </Box>
    );
  }

  const eventTypes = Object.keys(groupedBadges);
  const filteredBadges = selectedTab === "all" ? badges : groupedBadges[selectedTab] || [];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              mb: 4,
            }}
          >
            <GradientText>Mis Logros</GradientText>
          </Box>
        </motion.div>

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

        {filteredBadges.length === 0 ? (
          <EmptyState
            icon="🎖️"
            title="Aún no tienes insignias"
            description="Completa acciones en la plataforma para desbloquear logros"
          />
        ) : (
          <BadgeContainer>
            <AnimatePresence>
              {filteredBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BadgeCard>
                    <Box sx={{ p: 3, height: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          gap: 2,
                        }}
                      >
                        <BadgeIcon type={badge.event_type.name} />
                        <Box>
                          <Box
                            sx={{
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                              lineHeight: 1.2,
                            }}
                          >
                            <GradientText>{badge.name}</GradientText>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            {badge.event_type.name.replace(/_/g, " ")}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 3 }}>
                        {badge.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={`${badge.required_points} pts`}
                          color="primary"
                          size="small"
                          icon={<Stars sx={{ fontSize: "1rem" }} />}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {badge.user_type}
                        </Typography>
                      </Box>
                    </Box>
                  </BadgeCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </BadgeContainer>
        )}
      </Box>
    </Box>
  );
}