// frontend/src/app/about/layout.tsx
// frontend/src/app/about/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  styled,
  Tabs,
  Tab,
  Stack,
  ButtonBase,
  Container
} from "@mui/material";
import { 
  Info, 
  PrivacyTip, 
  ContactMail, 
  Gavel,
  ChevronRight
} from "@mui/icons-material";

const ContentCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  width: '100%'
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: '500',
  fontSize: '0.875rem',
  minHeight: '48px',
  color: theme.palette.text.secondary,
  padding: theme.spacing(1, 2),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: '600',
    backgroundColor: theme.palette.action.selected
  },
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  },
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'visible'
}));

const TabLink = styled(ButtonBase)(({ theme }) => ({
  width: '100%',
  height: '100%',
  textAlign: 'left',
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius
}));

interface PageLink {
  slug: string;
  title: string;
  icon: React.ReactNode;
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const currentPage = pathname.split("/").filter(Boolean).pop() || "us";

  const pages: PageLink[] = [
    { slug: "us", title: "Sobre Nosotros", icon: <Info /> },
    { slug: "policy", title: "Política de Privacidad", icon: <PrivacyTip /> },
    { slug: "contact", title: "Contacto", icon: <ContactMail /> },
    { slug: "privacy", title: "Aviso Legal", icon: <Gavel /> },
  ];

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      px: { xs: 2, sm: 4, md: 6 },
      mt: 8 // Added margin top to account for navbar
    }}>
      <Container maxWidth="xl" sx={{ p: 0 }}>
        <Paper sx={{ 
          borderRadius: '12px',
          mb: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}>
          <Tabs 
            value={currentPage}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTabs-indicator': {
                height: '3px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                minWidth: 'auto',
                minHeight: '56px'
              }
            }}
          >
            {pages.map((page) => (
              <StyledTab
                key={page.slug}
                value={page.slug}
                label={
                  <Link href={`/about/${page.slug}`} passHref legacyBehavior>
                    <TabLink>
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={1.5}
                        sx={{
                          position: 'relative',
                          pr: currentPage === page.slug ? '20px' : 0
                        }}
                      >
                        {page.icon}
                        <span>{page.title}</span>
                        {currentPage === page.slug && (
                          <ChevronRight 
                            sx={{ 
                              position: 'absolute',
                              right: 0,
                              fontSize: '1rem',
                              transform: 'rotate(90deg)',
                              color: theme.palette.primary.main
                            }} 
                          />
                        )}
                      </Stack>
                    </TabLink>
                  </Link>
                }
              />
            ))}
          </Tabs>
        </Paper>

        <ContentCard elevation={3}>
          {children}
        </ContentCard>
      </Container>
    </Container>
  );
}