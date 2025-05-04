// frontend/src/app/rankings/page.tsx
// Página de ranking global de usuarios y gamificación
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  styled,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  CardContent,
  Card
} from "@mui/material";
import {
  EmojiEvents,
  MilitaryTech,
  Leaderboard,
  Person,
  Whatshot,
  FilterList,
  MyLocation
} from "@mui/icons-material";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { RankingResponse } from "@/lib/types";

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(222, 226, 230, 0.5)',
  borderRadius: '16px',
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  color: theme.palette.text.primary,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '12px',
  padding: '12px 24px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  },
  '&.MuiButton-outlined': {
    background: 'transparent',
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  }
}));

const HighlightedRow = styled(Box)(({ theme }) => ({
  background: `${theme.palette.primary.light}20`,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  '&:hover': {
    background: `${theme.palette.primary.light}30`,
  }
}));

const RankingBadge = ({ position, isCurrentUser }: { position: number, isCurrentUser?: boolean }) => {
  const theme = useTheme();
  return (
    <Box sx={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isCurrentUser 
        ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      color: 'white',
      fontWeight: 700,
      boxShadow: theme.shadows[4]
    }}>
      #{position}
    </Box>
  );
};

export default function Rankings() {
  const theme = useTheme();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<RankingResponse[]>([]);
  const [sortBy, setSortBy] = useState<"points" | "badges_count">("points");
  const [currentUserPosition, setCurrentUserPosition] = useState<number | null>(null);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);
  const userRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Obtener el nombre de usuario anónimo del localStorage si existe
    const storedAnonUsername = localStorage.getItem("anonUsername");
    if (storedAnonUsername) {
      setAnonUsername(storedAnonUsername);
    }
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      const { data } = await fetchAPI<RankingResponse[]>("/v1/gamification/rankings");
      if (data) {
        setRankings(data);
        
        // Encontrar la posición del usuario actual (registrado o anónimo)
        const sorted = [...data].sort((a, b) =>
          sortBy === "points" ? b.points - a.points : b.badges_count - a.badges_count
        );
        
        // Buscar usuario registrado
        if (user) {
          const position = sorted.findIndex(r => r.username === user.username) + 1;
          setCurrentUserPosition(position > 0 ? position : null);
        } 
        // Buscar usuario anónimo
        else if (anonUsername) {
          const position = sorted.findIndex(r => r.username === anonUsername) + 1;
          setCurrentUserPosition(position > 0 ? position : null);
        }
      }
    };
    fetchRankings();
  }, [user, sortBy, anonUsername]);

  const sortedRankings = [...rankings].sort((a, b) =>
    sortBy === "points" ? b.points - a.points : b.badges_count - a.badges_count
  );

  const maxPoints = Math.max(...rankings.map(r => r.points), 0);
  const maxBadges = Math.max(...rankings.map(r => r.badges_count), 0);

  const scrollToUserPosition = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const isCurrentUser = (username: string) => {
    return (user && username === user.username) || 
           (!user && anonUsername && username === anonUsername);
  };


  return (
    <Box sx={{
      minHeight: '100vh',
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
            Clasificación Global
          </Typography>
          <Typography variant="subtitle1">
            Ranking de usuarios por participación
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={sortBy === "points" ? "contained" : "outlined"}
              onClick={() => setSortBy("points")}
              startIcon={<Whatshot />}
              sx={{
                background: sortBy === "points" 
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  : 'transparent',
                color: sortBy === "points" ? 'white' : 'inherit'
              }}
            >
              Por Puntos
            </Button>
            
            <Button
              variant={sortBy === "badges_count" ? "contained" : "outlined"}
              onClick={() => setSortBy("badges_count")}
              startIcon={<MilitaryTech />}
              sx={{
                background: sortBy === "badges_count" 
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  : 'transparent',
                color: sortBy === "badges_count" ? 'white' : 'inherit'
              }}
            >
              Por Insignias
            </Button>
          </Box>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { md: '60px 1fr repeat(3, 150px)' },
            gap: 2,
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="subtitle2" fontWeight={700}>POS</Typography>
            <Typography variant="subtitle2" fontWeight={700}>USUARIO</Typography>
            <Typography variant="subtitle2" fontWeight={700}>PUNTOS</Typography>
            <Typography variant="subtitle2" fontWeight={700}>INSIGNIAS</Typography>
            <Typography variant="subtitle2" fontWeight={700}>TIPO</Typography>
          </Box>

          <AnimatePresence>
            {sortedRankings.map((rank, index) => {
              const currentUser = isCurrentUser(rank.username);
              return (
                <motion.div
                  key={rank.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Box sx={{
                    p: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '60px 1fr repeat(3, 150px)' },
                    gap: 2,
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    background: currentUser ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                  }}>
                    <RankingBadge position={index + 1} isCurrentUser={currentUser} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: currentUser ? 'secondary.main' : 'primary.main',
                        color: 'white',
                        width: 40,
                        height: 40
                      }}>
                        {rank.username[0].toUpperCase()}
                      </Avatar>
                      <Typography fontWeight={600}>
                        {rank.username}
                        {currentUser && " (Tú)"}
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={maxPoints > 0 ? (rank.points / maxPoints) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MilitaryTech />
                      <Typography fontWeight={600}>
                        {rank.badges_count}
                      </Typography>
                    </Box>

                    <Chip
                      label={rank.user_type}
                      color={currentUser ? 'secondary' : 'primary'}
                      sx={{ borderRadius: 1, fontWeight: 700 }}
                    />
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </Box>
  );
}