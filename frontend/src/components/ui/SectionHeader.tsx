import { Box, Typography, Button, Divider, styled } from "@mui/material";

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <>
      <HeaderContainer>
        <Typography variant="h6" fontWeight="600">
          {title}
        </Typography>
        {action}
      </HeaderContainer>
      <Divider sx={{ mb: 3 }} />
    </>
  );
}