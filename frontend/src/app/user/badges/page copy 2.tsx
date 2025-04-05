// src/app/user/gamification/badges/page.tsx
// src/app/user/gamification/badges/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Box, 
  Typography, 
  Grid, 
  Chip, 
  Avatar, 
  useTheme, 
  styled 
} from "@mui/material";

import { GlassCard, GradientText, BadgeIcon, EmptyState } from "@/components/ui";
import fetchAPI from "@/lib/api";
import { UserGamificationResponse, Badge, EventType, BadgeWithEventType } from "@/lib/types";

import { EmojiEvents, Stars } from "@mui/icons-material";

const BadgeContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(3)
}));

const BadgeCard = styled(GlassCard)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const EventTypeSection = styled('section')(({ theme }) => ({
  marginBottom: theme.spacing(6),
  '& h2': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  }
}));

export default function Badges() {
  const theme = useTheme();
  const [badges, setBadges] = useState<BadgeWithEventType[]>([]);
  const [groupedBadges, setGroupedBadges] = useState<Record<string, BadgeWithEventType[]>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      const { data } = await fetchAPI<UserGamificationResponse[]>("/v1/gamification/me");
      if (data) {
        const userBadges = data
          .filter(g => g.badge)
          .map(g => ({
            ...g.badge!,
            event_type: g.event_type
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
    };
    fetchBadges();
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      p: { xs: 2, md: 4 }
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Mis Logros
          </Typography>
        </motion.div>

        {Object.entries(groupedBadges).map(([eventType, badges]) => (
          <EventTypeSection key={eventType}>
            <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <EmojiEvents sx={{ mr: 1, color: theme.palette.secondary.main }} />
              {eventType.replace(/_/g, ' ')}
            </Typography>
            
            <BadgeContainer>
              <AnimatePresence>
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BadgeCard>
                      <Box sx={{ p: 3, height: '100%' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 2,
                          gap: 2
                        }}>
                          <BadgeIcon type={badge.event_type.name} sx={{ 
                            fontSize: '3rem',
                            color: theme.palette.primary.main
                          }} />
                          <Box>
                            <GradientText sx={{ 
                              fontSize: '1.5rem', 
                              fontWeight: 'bold',
                              lineHeight: 1.2
                            }}>
                              {badge.name}
                            </GradientText>
                            <Typography variant="caption" color="textSecondary">
                              {badge.event_type.name}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 3 }}>
                          {badge.description}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Chip
                            label={`${badge.required_points} pts`}
                            color="primary"
                            size="small"
                            icon={<Stars sx={{ fontSize: '1rem' }} />}
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
          </EventTypeSection>
        ))}

        {badges.length === 0 && (
          <EmptyState
            icon="🎖️"
            title="Aún no tienes insignias"
            description="Completa acciones en la plataforma para desbloquear logros"
          />
        )}
      </Box>
    </Box>
  );
}