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
  styled,
  Tabs,
  Tab,
  Fade,
  Paper,
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

const BadgeCard = styled(Box)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  position: "relative",
  overflow: "hidden",
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  border: "1px solid rgba(222, 226, 230, 0.5)",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: "bold",
              mb: 4,
              textAlign: "center",
            }}
          >
            <GradientText>Mis Logros</GradientText>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
              Tus insignias de reconocimiento
            </Typography>
          </Box>
        </motion.div>

        <Paper elevation={0} sx={{ mb: 4, borderRadius: "12px", background: "rgba(255, 255, 255, 0.7)" }}>
          <StyledTabs
            value={selectedTab}
            onChange={(_, val) => setSelectedTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
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
                icon={<BadgeIcon type={type} />}
                iconPosition="start"
              />
            ))}
          </StyledTabs>
        </Paper>

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
                  whileHover={{ scale: 1.02 }}
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
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText
                          }}
                        >
                          <BadgeIcon type={badge.event_type.name} />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {badge.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {badge.event_type.name.replace(/_/g, " ")}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.primary" sx={{ mb: 3 }}>
                        {badge.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: "auto",
                        }}
                      >
                        <Chip
                          label={`${badge.required_points} pts`}
                          color="primary"
                          size="small"
                          icon={<Stars sx={{ fontSize: "1rem" }} />}
                          sx={{ 
                            background: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
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