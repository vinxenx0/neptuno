// frontend/src/app/rankings/page.tsx
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
  Tooltip
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

const RankingBadge = ({ position, isCurrentUser = false }: { position: number, isCurrentUser?: boolean }) => {
  const theme = useTheme();
  const getBadgeColor = () => {
    if (isCurrentUser) return { bg: theme.palette.secondary.main, text: theme.palette.secondary.contrastText };
    switch(position) {
      case 1: return { bg: '#ffd700', text: '#000' };
      case 2: return { bg: '#c0c0c0', text: '#000' };
      case 3: return { bg: '#cd7f32', text: '#000' };
      default: return { 
        bg: theme.palette.primary.main, 
        text: theme.palette.primary.contrastText 
      };
    }
  };
  
  return (
    <Box sx={{
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: getBadgeColor().bg,
      color: getBadgeColor().text,
      fontWeight: 'bold',
      boxShadow: theme.shadows[4],
      fontSize: '0.875rem',
      border: isCurrentUser ? `2px solid ${theme.palette.secondary.dark}` : 'none'
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
      p: { xs: 2, md: 4 },
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <EmojiEvents sx={{
            fontSize: '3rem',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }} />
          <Typography variant="h3" sx={{
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Clasificación Global
          </Typography>
        </Box>
      </motion.div>

      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        '& .MuiButton-root': {
          minWidth: '200px'
        }
      }}>
        <GradientButton
          onClick={() => setSortBy("points")}
          startIcon={<Whatshot />}
          variant={sortBy === "points" ? "contained" : "outlined"}
        >
          Ordenar por Puntos
        </GradientButton>
        
        <GradientButton
          onClick={() => setSortBy("badges_count")}
          startIcon={<MilitaryTech />}
          variant={sortBy === "badges_count" ? "contained" : "outlined"}
        >
          Ordenar por Insignias
        </GradientButton>

        {(user || anonUsername) && currentUserPosition && (
          <Tooltip title="Ir a mi posición" arrow>
            <GradientButton
              onClick={scrollToUserPosition}
              startIcon={<MyLocation />}
              variant="outlined"
              sx={{
                ml: 'auto',
                minWidth: 'auto',
                px: 3
              }}
            >
              Mi posición: #{currentUserPosition}
            </GradientButton>
          </Tooltip>
        )}
      </Box>

      {(user || anonUsername) && currentUserPosition === null && (
        <Box sx={{
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.warning.light,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <EmojiEvents color="warning" />
          <Typography variant="body1" color="text.secondary">
            No tienes ranking aún. ¡Participa más para aparecer en la clasificación!
          </Typography>
        </Box>
      )}

      <GlassCard>
        {/* Header de la tabla */}
        <Box sx={{
          p: 2,
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '60px 1fr repeat(3, 150px)',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.7)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">POS</Typography>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">USUARIO</Typography>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">PUNTOS</Typography>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">INSIGNIAS</Typography>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">TIPO</Typography>
        </Box>

        <AnimatePresence>
          {sortedRankings.map((rank, index) => {
            const currentUser = isCurrentUser(rank.username);
            const RowComponent = currentUser ? HighlightedRow : Box;
            
            return (
              <motion.div
                key={rank.username}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <RowComponent 
                  sx={{
                    p: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '60px 1fr repeat(3, 150px)' },
                    gap: 2,
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    '&:hover': { 
                      background: 'rgba(0, 0, 0, 0.02)',
                      transition: 'background 0.3s ease'
                    }
                  }}
                  ref={currentUser ? userRowRef : null}
                >
                  {/* Mobile Position */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <RankingBadge position={index + 1} isCurrentUser={currentUser} />
                  </Box>

                  {/* Desktop Position */}
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' }, 
                    justifyContent: 'center' 
                  }}>
                    <RankingBadge position={index + 1} isCurrentUser={currentUser} />
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    minWidth: 0
                  }}>
                    <Avatar sx={{
                      bgcolor: currentUser ? theme.palette.secondary.main : theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      boxShadow: theme.shadows[2]
                    }}>
                      {rank.username[0].toUpperCase()}
                    </Avatar>
                    <Typography 
                      variant="body1" 
                      fontWeight={currentUser ? "bold" : "500"}
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: currentUser ? theme.palette.secondary.dark : 'inherit'
                      }}
                    >
                      {rank.username}
                      {currentUser && (
                        <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                          (Tú)
                        </Box>
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    mt: { xs: 1, md: 0 },
                    gridColumn: { xs: '1 / -1', md: 'auto' }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={maxPoints > 0 ? (rank.points / maxPoints) * 100 : 0}
                        sx={{
                          flexGrow: 1,
                          height: 8,
                          borderRadius: 4,
                          background: 'rgba(0, 0, 0, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: currentUser 
                              ? `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`
                              : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        minWidth="fit-content"
                        color={currentUser ? theme.palette.secondary.dark : 'inherit'}
                      >
                        {rank.points.toLocaleString()} pts
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    gridColumn: { xs: '1 / -1', md: 'auto' }
                  }}>
                    <MilitaryTech color={currentUser ? "secondary" : "inherit"} />
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={currentUser ? theme.palette.secondary.dark : 'inherit'}
                    >
                      {rank.badges_count} / {maxBadges}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    gridColumn: { xs: '1 / -1', md: 'auto' },
                    justifySelf: { xs: 'start', md: 'center' }
                  }}>
                    <Chip
                      label={rank.user_type}
                      color={rank.user_type === 'admin' ? 'secondary' : currentUser ? 'secondary' : 'primary'}
                      variant={currentUser ? "filled" : "outlined"}
                      sx={{ 
                        borderRadius: '8px',
                        textTransform: 'capitalize',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </RowComponent>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sortedRankings.length === 0 && (
          <Box sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Leaderboard sx={{ 
              fontSize: 80, 
              color: 'text.secondary', 
              mb: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }} />
            <Typography variant="h6" color="textSecondary">
              No hay datos de clasificación disponibles
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              ¡Sé el primero en aparecer aquí!
            </Typography>
          </Box>
        )}
      </GlassCard>
    </Box>
  );
}