// frontend/src/app/rankings/page.tsx
// src/app/admin/rankings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

interface RankingResponse {
  username: string;
  points: number;
  badges_count: number;
  user_type: string;
}

export default function RankingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rankings, setRankings] = useState<RankingResponse[]>([]);
  const [enablePoints, setEnablePoints] = useState<boolean | null>(null);
  const [enableBadges, setEnableBadges] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [pointsRes, badgesRes, rankingsRes] = await Promise.all([
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_badges"),
          fetchAPI<RankingResponse[]>("/v1/admin/rankings"),
        ]);
        setEnablePoints(pointsRes.data === "true" || pointsRes.data === true);
        setEnableBadges(badgesRes.data === "true" || badgesRes.data === true);
        setRankings(rankingsRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      }
    };
    fetchData();
  }, [user, router]);

  if (!user || enablePoints === null || enableBadges === null) return null;

  return (
    <Box sx={{ p: 4, minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Rankings
        </Typography>

        {(!enablePoints && !enableBadges) ? (
          <Typography variant="body1" color="textSecondary">
            La gamificación está deshabilitada.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                {enablePoints && <TableCell>Puntos</TableCell>}
                {enableBadges && <TableCell>Insignias</TableCell>}
                <TableCell>Tipo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rankings.map((entry) => (
                <TableRow key={entry.username}>
                  <TableCell>{entry.username}</TableCell>
                  {enablePoints && <TableCell>{entry.points}</TableCell>}
                  {enableBadges && <TableCell>{entry.badges_count}</TableCell>}
                  <TableCell>{entry.user_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </Box>
  );
}