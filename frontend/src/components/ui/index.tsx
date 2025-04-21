// frontend/src/components/ui/index.tsx
// Componentes UI reutilizables (spinner, glass card, etc)
import { ReactNode } from "react";
import { motion } from "framer-motion";

export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"
  />
);

export const GlassCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 ${className}`}
    whileHover={{ scale: 1.02 }}
  >
    {children}
  </motion.div>
);

export const GradientText = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={`bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

export const BadgeIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, string> = {
    'api_usage': '💻',
    'survey_completed': '📝',
    'registration_completed': '🎯',
    'all_subscriptions': '📬',
    'default': '🏆'
  };
  
  return <div className={`${className} flex items-center justify-center text-4xl`}>{icons[type] || icons.default}</div>;
};

export const TimelineIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, string> = {
    'api_usage': '⬆️',
    'survey_completed': '✅',
    'registration_completed': '📋',
    'all_subscriptions': '📩',
    'default': '✨'
  };
  
  return <span className={`${className} text-2xl`}>{icons[type] || icons.default}</span>;
};

export const EmptyState = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mx-auto">{description}</p>
  </div>
);

// components/ui/index.tsx
export const RankingMedal = ({ position }: { position: number }) => {
  const colors = {
    1: "from-yellow-400 to-yellow-600",
    2: "from-gray-400 to-gray-600",
    3: "from-amber-600 to-amber-800",
    default: "from-purple-500 to-pink-500"
  };

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center 
      bg-gradient-to-r ${colors[position as keyof typeof colors] || colors.default}`}>
      <span className="font-bold text-white">{position}</span>
    </div>
  );
};

export const InteractiveDemo = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="relative overflow-hidden rounded-xl"
    whileHover={{ scale: 1.02 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20" />
    <div className="relative backdrop-blur-sm p-8">
      {children}
    </div>
  </motion.div>
);

export { StyledTabs, StatusChip, StyledCard } from './Styled';
export { default as FeatureDisabled } from './FeatureDisabled';
export { GradientCard, AdminGradientCard, ConfigGlassCard, FeatureCard } from './Styled';