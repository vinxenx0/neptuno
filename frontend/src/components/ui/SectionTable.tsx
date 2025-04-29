// frontend/src/components/ui/SectionTable.tsx
// This file defines a SectionTable component that uses Material-UI's Table component.
import { Table, TableBody, TableCell, TableHead, TableRow, styled } from "@mui/material";

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    borderColor: theme.palette.divider,
  },
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.background.default,
  },
}));

interface SectionTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function SectionTable({ headers, children }: SectionTableProps) {
  return (
    <StyledTable>
      <TableHead>
        <TableRow>
          {headers.map((header, index) => (
            <TableCell key={index}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {children}
      </TableBody>
    </StyledTable>
  );
}