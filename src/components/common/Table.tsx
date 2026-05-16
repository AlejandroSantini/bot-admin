import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import type { ReactNode } from 'react';
import { CustomPaper } from './CustomPaper';

export interface TableColumn<T> {
  label: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  hideOnMobile?: boolean;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  sx?: object;
  getRowSx?: (row: T) => object;
  pagination?: ReactNode;
}

export function Table<T>({ 
  columns, 
  data, 
  getRowKey, 
  onRowClick, 
  emptyMessage = 'Sin datos', 
  sx, 
  getRowSx,
  pagination
}: TableProps<T>) {
  return (
    <CustomPaper 
      sx={{ 
        width: '100%', 
        p: 0, 
        mb: 2, 
        borderRadius: 1.5,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
        border: '1px solid',
        borderColor: 'divider',
        ...sx 
      }}
    >
      <TableContainer
        sx={{
          maxWidth: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
          },
        }}
      >
        <MuiTable size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              {columns.map((col, idx) => (
                <TableCell
                  key={col.label + idx}
                  align={col.align || 'left'}
                  sx={{
                    fontWeight: 500,
                    color: 'text.secondary',
                    borderBottom: '1px solid',
                    borderBottomColor: 'divider',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                    ...(col.hideOnMobile ? { display: { xs: 'none', md: 'table-cell' } } : {}),
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map(row => (
                <TableRow
                  key={getRowKey(row)}
                  hover
                  sx={{
                    transition: 'background 0.2s',
                    ...(getRowSx ? getRowSx(row) : {}),
                    '&:hover': { backgroundColor: 'action.selected', cursor: onRowClick ? 'pointer' : 'default' }
                  }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col, idx) => (
                    <TableCell
                      key={col.label + idx}
                      align={col.align || 'left'}
                      sx={{
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        px: { xs: 1.5, sm: 2 },
                        py: 1,
                        whiteSpace: { xs: 'nowrap', sm: 'normal' },
                        ...(col.hideOnMobile ? { display: { xs: 'none', md: 'table-cell' } } : {}),
                      }}
                    >
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {pagination && (
        <Box sx={{ borderTop: '1px solid', borderTopColor: 'divider', p: 1 }}>
          {pagination}
        </Box>
      )}
    </CustomPaper>
  );
}
