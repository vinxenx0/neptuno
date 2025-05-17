import { styled } from "@mui/material";

export const GradientCard = styled("div")(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: "white",
  borderRadius: "16px",
  boxShadow: theme.shadows[4],
}));

export const GlassCard = styled("div")(({ theme }) => ({
  background: "rgba(248, 249, 250, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(222, 226, 230, 0.5)",
  borderRadius: "16px",
  boxShadow: theme.shadows[2],
}));