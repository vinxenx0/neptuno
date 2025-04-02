// frontend/src/app/about/layout.tsx
// frontend/src/app/about/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  Paper, 
  useTheme,
  styled
} from "@mui/material";
import { 
  Info, 
  PrivacyTip, 
  ContactMail, 
  Gavel,
  ChevronRight
} from "@mui/icons-material";

const GlassSidebar = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  height: 'fit-content'
}));

const ContentCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  flex: 1
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderRadius: '12px',
  textDecoration: 'none',
  color: theme.palette.text.primary,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(4px)'
  },
  '&.active': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[2]
  }
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
    <Box sx={{ 
      display: 'flex', 
      gap: 4, 
      p: 4, 
      maxWidth: '1400px', 
      mx: 'auto',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <GlassSidebar>
        <Typography 
          variant="h5" 
          component="h2" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Info color="primary" />
          Información Legal
        </Typography>
        
        <List sx={{ p: 0 }}>
          {pages.map((page) => (
            <ListItem key={page.slug} sx={{ p: 0, mb: 1 }}>
              <StyledLink
                href={`/about/${page.slug}`}
                className={currentPage === page.slug ? 'active' : ''}
                prefetch={false}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {page.icon}
                  <Typography variant="body1" fontWeight={currentPage === page.slug ? 'bold' : 'normal'}>
                    {page.title}
                  </Typography>
                </Box>
                <ChevronRight sx={{ 
                  opacity: currentPage === page.slug ? 1 : 0.5,
                  transform: currentPage === page.slug ? 'rotate(90deg)' : 'none',
                  transition: 'all 0.3s ease'
                }} />
              </StyledLink>
            </ListItem>
          ))}
        </List>
      </GlassSidebar>

      <ContentCard>
        {children}
      </ContentCard>
    </Box>
  );
}