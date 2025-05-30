import { Box, Typography, Grid, Divider, Chip, Switch } from "@mui/material";
import { FeatureCard } from "@/components/ui/Styled";
import { PersonAdd, PeopleOutline, Security, AttachMoney, MonetizationOn, EmojiEvents, ShoppingCart, LocalActivity } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

interface FeaturesSectionProps {
  features: {
    enable_registration: boolean;
    enable_social_login: boolean;
    disable_anonymous_users: boolean;
    disable_credits: boolean;
    enable_payment_methods: boolean;
    enable_points: boolean;
    enable_badges: boolean;
    enable_coupons: boolean;
    enable_marketplace: boolean;
  };
  onToggle: (feature: string, enabled: boolean) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features, onToggle }) => {
  const theme = useTheme();

  const getFeatureDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      enable_registration: "Permite a nuevos usuarios registrarse en la plataforma.",
      enable_social_login: "Permite el inicio de sesión con redes sociales.",
      disable_anonymous_users: "Impide el acceso a usuarios no registrados.",
      disable_credits: "Deshabilita el sistema de créditos en la plataforma.",
      enable_payment_methods: "Habilita diferentes métodos de pago.",
      enable_points: "Activa el sistema de puntos por actividades.",
      enable_badges: "Permite la obtención de insignias.",
      enable_coupons: "Permite la creación y uso de cupones.",
      enable_marketplace: "Habilita el sistema de marketplace.",
    };
    return descriptions[key] || "Funcionalidad del sistema";
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Funcionalidades</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_registration ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PersonAdd sx={{ fontSize: 40, mr: 2, color: features.enable_registration ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Registro de Usuarios</Typography>
                  <Typography variant="body2" color="textSecondary">Controla si los nuevos usuarios pueden registrarse</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_registration ? "Activado" : "Desactivado"} color={features.enable_registration ? "success" : "error"} />
                <Switch checked={features.enable_registration} onChange={(e) => onToggle("enable_registration", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_registration")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_social_login ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PeopleOutline sx={{ fontSize: 40, mr: 2, color: features.enable_social_login ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Login Social</Typography>
                  <Typography variant="body2" color="textSecondary">Permite inicio de sesión con redes sociales</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_social_login ? "Activado" : "Desactivado"} color={features.enable_social_login ? "success" : "error"} />
                <Switch checked={features.enable_social_login} onChange={(e) => onToggle("enable_social_login", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_social_login")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.disable_anonymous_users ? theme.palette.error.main : theme.palette.success.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Security sx={{ fontSize: 40, mr: 2, color: features.disable_anonymous_users ? theme.palette.error.main : theme.palette.success.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Usuarios Anónimos</Typography>
                  <Typography variant="body2" color="textSecondary">Controla el acceso de usuarios no registrados</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.disable_anonymous_users ? "Bloqueados" : "Permitidos"} color={features.disable_anonymous_users ? "error" : "success"} />
                <Switch checked={features.disable_anonymous_users} onChange={(e) => onToggle("disable_anonymous_users", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("disable_anonymous_users")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.disable_credits ? theme.palette.error.main : theme.palette.success.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AttachMoney sx={{ fontSize: 40, mr: 2, color: features.disable_credits ? theme.palette.error.main : theme.palette.success.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Sistema de Créditos</Typography>
                  <Typography variant="body2" color="textSecondary">Habilita/deshabilita el uso de créditos</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.disable_credits ? "Desactivado" : "Activado"} color={features.disable_credits ? "error" : "success"} />
                <Switch checked={!features.disable_credits} onChange={(e) => onToggle("disable_credits", !e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("disable_credits")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_payment_methods ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <MonetizationOn sx={{ fontSize: 40, mr: 2, color: features.enable_payment_methods ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Métodos de Pago</Typography>
                  <Typography variant="body2" color="textSecondary">Habilita diferentes opciones de pago</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_payment_methods ? "Activado" : "Desactivado"} color={features.enable_payment_methods ? "success" : "error"} />
                <Switch checked={features.enable_payment_methods} onChange={(e) => onToggle("enable_payment_methods", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_payment_methods")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_points ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, mr: 2, color: features.enable_points ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Sistema de Puntos</Typography>
                  <Typography variant="body2" color="textSecondary">Activa puntos por actividades</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_points ? "Activado" : "Desactivado"} color={features.enable_points ? "success" : "error"} />
                <Switch checked={features.enable_points} onChange={(e) => onToggle("enable_points", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_points")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_badges ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EmojiEvents sx={{ fontSize: 40, mr: 2, color: features.enable_badges ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Sistema de Insignias</Typography>
                  <Typography variant="body2" color="textSecondary">Permite la obtención de insignias</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_badges ? "Activado" : "Desactivado"} color={features.enable_badges ? "success" : "error"} />
                <Switch checked={features.enable_badges} onChange={(e) => onToggle("enable_badges", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_badges")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_coupons ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LocalActivity sx={{ fontSize: 40, mr: 2, color: features.enable_coupons ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Cupones</Typography>
                  <Typography variant="body2" color="textSecondary">Habilita el sistema de cupones</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_coupons ? "Activado" : "Desactivado"} color={features.enable_coupons ? "success" : "error"} />
                <Switch checked={features.enable_coupons} onChange={(e) => onToggle("enable_coupons", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_coupons")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <FeatureCard sx={{ borderLeft: `4px solid ${features.enable_marketplace ? theme.palette.success.main : theme.palette.error.main}` }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShoppingCart sx={{ fontSize: 40, mr: 2, color: features.enable_marketplace ? theme.palette.success.main : theme.palette.error.main }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Marketplace</Typography>
                  <Typography variant="body2" color="textSecondary">Habilita el sistema de marketplace</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Chip label={features.enable_marketplace ? "Activado" : "Desactivado"} color={features.enable_marketplace ? "success" : "error"} />
                <Switch checked={features.enable_marketplace} onChange={(e) => onToggle("enable_marketplace", e.target.checked)} />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>{getFeatureDescription("enable_marketplace")}</Typography>
            </Box>
          </FeatureCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeaturesSection;