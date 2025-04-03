"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import fetchAPI from "@/lib/api";
import { RankingResponse } from "@/lib/types";

export default function Rankings() {
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Rankings</Typography>
      <Box sx={{ mb: 2 }}>
        <Button onClick={() => setSortBy("points")} variant={sortBy === "points" ? "contained" : "outlined"}>Por Puntos</Button>
        <Button onClick={() => setSortBy("badges_count")} variant={sortBy === "badges_count" ? "contained" : "outlined"} sx={{ ml: 2 }}>Por Insignias</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Puntos</TableCell>
              <TableCell>Insignias</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRankings.map((rank, index) => (
              <TableRow key={index}>
                <TableCell>{rank.username}</TableCell>
                <TableCell>{rank.points}</TableCell>
                <TableCell>{rank.badges_count}</TableCell>
                <TableCell>{rank.user_type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}