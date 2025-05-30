import { Box, Typography } from "@mui/material";
import MarketplaceManagement from "@/components/admin/MarketplaceManagement";

const MarketplaceSection: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Marketplace</Typography>
      <MarketplaceManagement />
    </Box>
  );
};

export default MarketplaceSection;