import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import { Delete as DeleteIcon, PushPin as PinIcon } from '@mui/icons-material';

export interface NoteNodeData {
  text: string;
  onUpdateText?: (text: string) => void;
  onDeleteNode?: () => void;
}

export default function NoteNode({ data }: { data: NoteNodeData }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(data.text);

  const handleSave = () => {
    data.onUpdateText?.(val);
    setEditing(false);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        width: 220,
        minHeight: 120,
        bgcolor: '#fef3c7', // Classic sticky note yellow
        border: '1px solid #fde68a',
        p: 1.5,
        position: 'relative',
        transform: 'rotate(-1deg)', // Slight rotation for "sticky note" look
        '&:hover': { transform: 'rotate(0deg)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
        transition: 'all 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, opacity: 0.6 }}>
        <PinIcon sx={{ fontSize: 16, color: '#d97706' }} />
        <Tooltip title="Eliminar nota">
          <IconButton size="small" onClick={() => data.onDeleteNode?.()} sx={{ p: 0.2, color: 'error.main', '&:hover': { bgcolor: 'error.light', color: '#fff' } }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {editing ? (
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="standard"
          value={val}
          autoFocus
          onBlur={handleSave}
          onChange={(e) => setVal(e.target.value)}
          sx={{
            '& .MuiInputBase-input': { fontSize: 13, color: '#92400e', lineHeight: 1.4 },
          }}
          InputProps={{ disableUnderline: true }}
        />
      ) : (
        <Box 
          onClick={() => setEditing(true)}
          sx={{ cursor: 'text', minHeight: 80 }}
        >
          <Box sx={{ fontSize: 13, color: '#92400e', whiteSpace: 'pre-wrap', fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
            {data.text || 'Hacé clic para escribir una nota...'}
          </Box>
        </Box>
      )}

      {/* Note nodes don't usually have handles unless they are linked to logic, 
          but we'll keep them optional or hidden */}
    </Paper>
  );
}
