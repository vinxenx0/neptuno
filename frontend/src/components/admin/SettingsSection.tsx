import { Box, Typography, Button, Grid, TextField, Accordion, AccordionSummary, AccordionDetails, Avatar, Chip } from "@mui/material";
import { ExpandMore, Settings as SettingsIcon } from "@mui/icons-material";
import { SiteSetting } from "@/lib/types";
import { ConfigGlassCard } from "@/components/ui/Styled";

interface SettingsSectionProps {
  settingsByTag: Record<string, SiteSetting[]>;
  expandedSettings: Record<string, boolean>;
  setExpandedSettings: (value: Record<string, boolean>) => void;
  allSettingsExpanded: boolean;
  setAllSettingsExpanded: (value: boolean) => void;
  onSave: (key: string, newValue: string) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  settingsByTag,
  expandedSettings,
  setExpandedSettings,
  allSettingsExpanded,
  setAllSettingsExpanded,
  onSave,
}) => {
  const toggleAllSettings = () => {
    const newState = !allSettingsExpanded;
    setAllSettingsExpanded(newState);
    setExpandedSettings(Object.keys(expandedSettings).reduce((acc, tag) => ({ ...acc, [tag]: newState }), {}));
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Configuraciones</Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" onClick={toggleAllSettings} startIcon={<ExpandMore />}>
          {allSettingsExpanded ? "Contraer Todo" : "Expandir Todo"}
        </Button>
      </Box>
      {Object.entries(settingsByTag).map(([tag, settings]) => (
        <ConfigGlassCard key={tag} sx={{ mb: 2 }}>
          <Accordion
            sx={{ background: "transparent", boxShadow: "none" }}
            expanded={expandedSettings[tag] || false}
            onChange={() => setExpandedSettings({ ...expandedSettings, [tag]: !expandedSettings[tag] })}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}><SettingsIcon sx={{ fontSize: 16 }} /></Avatar>
                <Typography variant="h6">{tag}</Typography>
                <Chip label={`${settings.length} configs`} size="small" color="primary" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {settings.map((setting) => (
                  <Grid item xs={12} md={6} key={setting.key}>
                    <TextField
                      label={setting.key}
                      defaultValue={setting.value}
                      onBlur={(e) => onSave(setting.key, e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      helperText={setting.description}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </ConfigGlassCard>
      ))}
    </Box>
  );
};

export default SettingsSection;