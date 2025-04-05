// frontend/src/app/rankings/page.tsx
// src/app/rankings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GradientText, EmptyState, RankingMedal } from "@/components/ui";
import fetchAPI from "@/lib/api";
import { RankingResponse } from "@/lib/types";

const RankingTable = ({ rankings }: { rankings: RankingResponse[] }) => (
  <div className="space-y-4">
    <AnimatePresence>
      {rankings.map((rank, index) => (
        <motion.div
          key={rank.username}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <GlassCard className="p-6 hover:transform hover:scale-[1.02] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <RankingMedal position={index + 1} />
                <div>
                  <h3 className="text-xl font-semibold text-white">{rank.username}</h3>
                  <p className="text-gray-400 capitalize">{rank.user_type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex gap-6">
                  <div>
                    <p className="text-gray-400">Puntos</p>
                    <p className="text-2xl font-bold text-purple-400">{rank.points}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Insignias</p>
                    <p className="text-2xl font-bold text-pink-400">{rank.badges_count}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            <GradientText>Clasificación Global</GradientText>
          </h1>
          
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setSortBy("points")}
              className={`px-6 py-2 rounded-full transition-all ${
                sortBy === "points" 
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
            >
              Por Puntos
            </button>
            <button
              onClick={() => setSortBy("badges_count")}
              className={`px-6 py-2 rounded-full transition-all ${
                sortBy === "badges_count"
                  ? "bg-pink-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
            >
              Por Insignias
            </button>
          </div>
        </motion.div>

        {sortedRankings.length > 0 ? (
          <RankingTable rankings={sortedRankings.slice(0, 20)} />
        ) : (
          <EmptyState
            icon="🏆"
            title="No hay rankings disponibles"
            description="¡Sé el primero en aparecer aquí!"
          />
        )}
      </div>
    </div>
  );
}