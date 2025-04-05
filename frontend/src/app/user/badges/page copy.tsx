// src/app/user/gamification/badges/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, GradientText, BadgeIcon, EmptyState } from "@/components/ui";
import fetchAPI from "@/lib/api";
import { UserGamificationResponse, Badge, EventType, BadgeWithEventType } from "@/lib/types";

const BadgeGrid = ({ badges }: { badges: BadgeWithEventType[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
    <AnimatePresence>
      {badges.map((badge) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="h-full p-6 hover:transform hover:scale-105 transition-all">
            <div className="flex items-start gap-4">
              <BadgeIcon type={badge.event_type.name} className="w-16 h-16" />
              <div className="flex-1">
                <GradientText className="text-2xl font-bold mb-2">
                  {badge.name}
                </GradientText>
                <p className="text-gray-300 mb-3">{badge.description}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {badge.required_points} pts
                  </span>
                  <span className="text-sm text-purple-400">
                    {badge.event_type.name}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default function Badges() {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-white mb-8">
          <GradientText>Mis Logros</GradientText>
        </h1>

        {Object.entries(groupedBadges).map(([eventType, badges]) => (
          <section key={eventType} className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 capitalize">
              {eventType.replace(/_/g, ' ')}
            </h2>
            <BadgeGrid badges={badges} />
          </section>
        ))}

        {badges.length === 0 && (
          <EmptyState
            icon="🎖️"
            title="Aún no tienes insignias"
            description="Completa acciones en la plataforma para desbloquear logros"
          />
        )}
      </motion.div>
    </div>
  );
}