import { IconButton } from '@mui/material';
import Link from 'next/link';
import { ArrowBack } from '@mui/icons-material';

export default function BackButton({ href }: { href: string }) {
  return (
    <IconButton component={Link} href={href} sx={{ mr: 1 }}>
      <ArrowBack />
    </IconButton>
  );
}