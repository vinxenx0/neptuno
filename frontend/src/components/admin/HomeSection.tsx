import { Box, Typography } from "@mui/material";
import { AdminGradientCard } from "@/components/ui/Styled";
import { Settings, Public, Webhook, EmojiEvents, MonetizationOn } from "@mui/icons-material";

interface HomeSectionProps {
  settingsCount: number;
  originsCount: number;
  integrationsCount: number;
  eventTypesCount: number;
  paymentProvidersCount: number;
}

const HomeSection: React.FC<HomeSectionProps> = ({
  settingsCount,
  originsCount,
  integrationsCount,
  eventTypesCount,
  paymentProvidersCount,
}) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Inicio</Typography>
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <AdminGradientCard sx={{ flex: 1, minWidth: "200px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>Configuraciones</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{settingsCount}</Typography>
            </Box>
            <Settings sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </AdminGradientCard>
        <AdminGradientCard sx={{ flex: 1, minWidth: "200px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>Orígenes Permitidos</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{originsCount}</Typography>
            </Box>
            <Public sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </AdminGradientCard>
        <AdminGradientCard sx={{ flex: 1, minWidth: "200px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>Integraciones</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{integrationsCount}</Typography>
            </Box>
            <Webhook sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </AdminGradientCard>
        <AdminGradientCard sx={{ flex: 1, minWidth: "200px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>Gamificación</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{eventTypesCount}</Typography>
            </Box>
            <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </AdminGradientCard>
        <AdminGradientCard sx={{ flex: 1, minWidth: "200px" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Box>
              <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>Pagos</Typography>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{paymentProvidersCount}</Typography>
            </Box>
            <MonetizationOn sx={{ fontSize: 40, opacity: 0.8 }} />
          </Box>
        </AdminGradientCard>
      </Box>
    </Box>
  );
};

export default HomeSection;