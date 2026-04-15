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
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: (theme) => 
          theme.palette.mode === 'light' 
            ? '0 2px 8px 0 rgba(0,0,0,0.04)' 
            : '0 4px 12px 0 rgba(0,0,0,0.4)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}