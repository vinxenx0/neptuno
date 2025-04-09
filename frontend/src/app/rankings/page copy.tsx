"use client";

import { useState, useEffect } from "react";
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
  IconButton
} from "@mui/material";
import {
  EmojiEvents,
  MilitaryTech,
  Leaderboard,
  Person,
  Whatshot,
  FilterList
} from "@mui/icons-material";
import fetchAPI from "@/lib/api";
import { RankingResponse } from "@/lib/types";

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  overflow: 'hidden',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '12px',
  padding: '12px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const RankingBadge = ({ position }: { position: number }) => {
  const theme = useTheme();
  const getBadgeColor = () => {
    switch(position) {
      case 1: return { bg: '#ffd700', text: '#000' };
      case 2: return { bg: '#c0c0c0', text: '#000' };
      case 3: return { bg: '#cd7f32', text: '#000' };
      default: return { bg: theme.palette.primary.main, text: '#fff' };
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
      boxShadow: theme.shadows[4]
    }}>
      #{position}
    </Box>
  );
};

export default function Rankings() {
  const theme = useTheme();
  const [rankings, setRankings] = useState<RankingResponse[]>([]);
  const [sortBy, setSortBy] = useState<"points" | "badges_count">("points");

  useEffect(() => {
    const fetchRankings = async () => {
      const { data } = await fetchAPI<RankingResponse[]>("/v1/gamification/rankings");
      if (data) setRankings(data);
    };
    fetchRankings();
  }, []);

  const sortedRankings = [...rankings].sort((a, b) =>
    sortBy === "points" ? b.points - a.points : b.badges_count - a.badges_count
  );

  const maxPoints = Math.max(...rankings.map(r => r.points));
  const maxBadges = Math.max(...rankings.map(r => r.badges_count));

  return (
    <Box sx={{
      minHeight: '100vh',
      p: { xs: 2, md: 4 },
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
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

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
      </Box>

      <GlassCard>
        <Box sx={{
          p: 2,
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '40px 1fr repeat(3, 150px)',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)'
        }}>
          <Typography variant="subtitle2" color="textSecondary">POS</Typography>
          <Typography variant="subtitle2" color="textSecondary">USUARIO</Typography>
          <Typography variant="subtitle2" color="textSecondary">PUNTOS</Typography>
          <Typography variant="subtitle2" color="textSecondary">INSIGNIAS</Typography>
          <Typography variant="subtitle2" color="textSecondary">TIPO</Typography>
        </Box>

        <AnimatePresence>
          {sortedRankings.map((rank, index) => (
            <motion.div
              key={rank.username}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Box sx={{
                p: 2,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '40px 1fr repeat(3, 150px)' },
                gap: 2,
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.03)' }
              }}>
                {/* Mobile Position */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <RankingBadge position={index + 1} />
                </Box>

                {/* Desktop Position */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                  <RankingBadge position={index + 1} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                    boxShadow: theme.shadows[4]
                  }}>
                    {rank.username[0].toUpperCase()}
                  </Avatar>
                  <Typography variant="body1" fontWeight="500">
                    {rank.username}
                  </Typography>
                </Box>

                <Box sx={{ mt: { xs: 1, md: 0 } }}>
                  <LinearProgress
                    variant="determinate"
                    value={(rank.points / maxPoints) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {rank.points.toLocaleString()} pts
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MilitaryTech color="secondary" />
                  <Typography variant="body2">
                    {rank.badges_count} / {maxBadges}
                  </Typography>
                </Box>

                <Chip
                  label={rank.user_type}
                  color={rank.user_type === 'admin' ? 'secondary' : 'primary'}
                  variant="outlined"
                  sx={{ 
                    justifySelf: 'start',
                    borderRadius: '8px',
                    textTransform: 'capitalize'
                  }}
                />
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {sortedRankings.length === 0 && (
          <Box sx={{
            p: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Leaderboard sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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