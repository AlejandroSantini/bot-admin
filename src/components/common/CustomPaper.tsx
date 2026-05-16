import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import React from 'react';

export interface CustomPaperProps extends PaperProps {
  children: React.ReactNode;
}

export function CustomPaper({ children, sx, ...props }: CustomPaperProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}