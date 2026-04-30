import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { systemService } from '../../services/systemService';
import {
  Box, Typography, Paper, IconButton, Tooltip, TextField, Popover, Select, MenuItem, FormControl
} from '@mui/material';
import {
  SmartButton as ButtonIcon,
  ListAlt as ListIcon,
  Notes as TextIcon,
  Settings as ActionIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  DynamicForm as FormIcon,
} from '@mui/icons-material';

export type MessageNodeType = 'text' | 'buttons' | 'list' | 'action' | 'form';

export interface MessageNodeData {
  type: MessageNodeType;
  text: string;
  isNew?: boolean;
  options?: { id: string; label: string }[];
  onUpdateText?: (text: string) => void;
  onUpdateOption?: (id: string, label: string) => void;
  onDeleteOption?: (id: string) => void;
  onAddOption?: () => void;
  onDeleteNode?: () => void;
  onDuplicateNode?: () => void;
  onSelectType?: (type: MessageNodeType) => void;
}

const TYPE_META: Record<MessageNodeType, { label: string; color: string; borderColor: string; icon: React.ReactNode }> = {
  text:    { label: 'Texto',            color: '#f8f9fa', borderColor: '#adb5bd', icon: <TextIcon   fontSize="small" sx={{ color: '#495057' }} /> },
  buttons: { label: 'Botones (Max 3)', color: '#e8f4fd', borderColor: '#1976d2', icon: <ButtonIcon  fontSize="small" sx={{ color: '#1976d2' }} /> },
  list:    { label: 'Lista',            color: '#e8f5e9', borderColor: '#2e7d32', icon: <ListIcon    fontSize="small" sx={{ color: '#2e7d32' }} /> },
  action:  { label: 'Módulo Interno',   color: '#fff3e0', borderColor: '#ed6c02', icon: <ActionIcon  fontSize="small" sx={{ color: '#ed6c02' }} /> },
  form:    { label: 'Formulario IA',    color: '#f3e5f5', borderColor: '#9c27b0', icon: <FormIcon    fontSize="small" sx={{ color: '#9c27b0' }} /> },
};

interface MessageNodeProps {
  data: MessageNodeData;
  isConnectable?: boolean;
  [key: string]: any;
}

// Removed static ACTION_LABELS

export default function MessageNode({ data, isConnectable }: MessageNodeProps) {
  const d = data as MessageNodeData;
  const meta = TYPE_META[d.type] || TYPE_META.text;

  const [editingText, setEditingText] = useState(false);
  const [textVal, setTextVal] = useState(d.text);
  const [editingOptId, setEditingOptId] = useState<string | null>(null);
  const [optVal, setOptVal] = useState('');
  const [typeAnchor, setTypeAnchor] = useState<HTMLElement | null>(null);
  const [systemModules, setSystemModules] = useState<{id: string, label: string}[]>([]);

  useEffect(() => {
    systemService.getModules().then(mods => setSystemModules(mods));
  }, []);

  const getModuleLabel = (id: string) => {
    const mod = systemModules.find(m => m.id === id);
    return mod ? mod.label : id;
  };

  // ── NEW NODE: type picker ──
  if (d.isNew) {
    const types: { t: MessageNodeType; emoji: string; label: string }[] = [
      { t: 'text',    emoji: '💬', label: 'Texto'   },
      { t: 'buttons', emoji: '🔘', label: 'Botones' },
      { t: 'list',    emoji: '📋', label: 'Lista'   },
      { t: 'action',  emoji: '⚙️', label: 'Módulo'  },
      { t: 'form',    emoji: '📝', label: 'Form IA' },
    ];
    return (
      <Paper elevation={6} sx={{ width: 280, borderRadius: 2, overflow: 'hidden', border: '2px dashed #7c3aed', bgcolor: '#1e1e2f' }}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable}
          style={{ background: '#7c3aed', width: 12, height: 12, top: -6 }} />
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #333' }}>
          <Typography variant="caption" fontWeight="bold" sx={{ color: '#aaa' }}>Nuevo nodo — Elegí el tipo:</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1.5 }}>
          {types.map(({ t, emoji, label }) => (
            <Box
              key={t}
              onClick={() => d.onSelectType?.(t)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1.5,
                border: '1px solid #333',
                p: 1,
                textAlign: 'center',
                bgcolor: '#111',
                transition: 'all .15s',
                '&:hover': { bgcolor: TYPE_META[t].borderColor + '33', borderColor: TYPE_META[t].borderColor },
              }}
            >
              <Typography sx={{ fontSize: 20 }}>{emoji}</Typography>
              <Typography variant="caption" sx={{ color: '#ccc', fontWeight: 600 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
          style={{ background: '#7c3aed', width: 12, height: 12, bottom: -6 }} />
      </Paper>
    );
  }

  const saveText = () => {
    d.onUpdateText?.(textVal);
    setEditingText(false);
  };

  const startEditOpt = (id: string, label: string) => {
    setEditingOptId(id);
    setOptVal(label);
  };

  const saveOpt = (id: string) => {
    d.onUpdateOption?.(id, optVal);
    setEditingOptId(null);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: 280,
        borderRadius: 2,
        overflow: 'visible',
        border: `2px solid ${meta.borderColor}`,
        bgcolor: meta.color,
        position: 'relative',
      }}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: meta.borderColor, width: 12, height: 12, top: -6 }}
      />

      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5, py: 0.75,
        bgcolor: meta.borderColor + '22',
        borderBottom: `1px solid ${meta.borderColor}44`,
      }}>
        {/* Clickable type badge */}
        <Tooltip title="Clic para cambiar tipo de nodo">
          <Box
            onClick={e => setTypeAnchor(e.currentTarget as HTMLElement)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              cursor: 'pointer', borderRadius: 1,
              px: 0.5, py: 0.25,
              '&:hover': { bgcolor: meta.borderColor + '33' },
            }}
          >
            {meta.icon}
            <Typography variant="caption" fontWeight="bold" sx={{ color: meta.borderColor }}>
              {meta.label}
            </Typography>
            <Typography variant="caption" sx={{ color: meta.borderColor, opacity: 0.6, fontSize: 10 }}>▼</Typography>
          </Box>
        </Tooltip>

        {/* Type change Popover */}
        <Popover
          open={Boolean(typeAnchor)}
          anchorEl={typeAnchor}
          onClose={() => setTypeAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ zIndex: 99999 }}
        >
          <Box sx={{ p: 0.5, display: 'flex', flexDirection: 'column', minWidth: 160 }}>
            {(['text', 'buttons', 'list', 'action', 'form'] as MessageNodeType[]).map(t => (
              <Box
                key={t}
                onClick={() => { d.onSelectType?.(t); setTypeAnchor(null); }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
                  cursor: 'pointer', borderRadius: 1,
                  bgcolor: d.type === t ? TYPE_META[t].borderColor + '22' : 'transparent',
                  '&:hover': { bgcolor: TYPE_META[t].borderColor + '22' },
                }}
              >
                {TYPE_META[t].icon}
                <Typography variant="caption" fontWeight={d.type === t ? 'bold' : 'normal'} sx={{ color: TYPE_META[t].borderColor }}>
                  {TYPE_META[t].label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Popover>

        {/* Duplicate + Delete buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Tooltip title="Duplicar nodo">
            <IconButton
              size="small"
              onClick={() => d.onDuplicateNode?.()}
              sx={{ color: meta.borderColor, '&:hover': { bgcolor: meta.borderColor + '22' } }}
            >
              <CopyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar nodo">
            <IconButton
              size="small"
              onClick={() => d.onDeleteNode?.()}
              sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.main', color: '#fff' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Body text */}
      <Box sx={{ p: 1.5, borderBottom: d.options?.length ? `1px solid ${meta.borderColor}33` : 'none' }}>
        {editingText ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {d.type === 'action' ? (
              <FormControl size="small" fullWidth>
                <Select
                  value={systemModules.some(m => m.id === textVal) ? textVal : (systemModules[0]?.id || '')}
                  onChange={e => setTextVal(e.target.value)}
                  sx={{ bgcolor: '#fff', fontSize: 13, '& .MuiSelect-select': { color: '#111', py: 1 } }}
                  displayEmpty
                >
                  {systemModules.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : d.type === 'form' ? (
              <TextField
                size="small"
                multiline
                rows={2}
                fullWidth
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                autoFocus
                placeholder="Ej: Pedir datos personales..."
                helperText="El backend iterará sobre las variables"
                sx={{
                  '& .MuiInputBase-input, & textarea': { color: '#111 !important', fontSize: 13 },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                  '& .MuiFormHelperText-root': { color: '#555' },
                }}
              />
            ) : (
              <TextField
                size="small"
                multiline
                rows={3}
                fullWidth
                value={textVal}
                onChange={e => setTextVal(e.target.value)}
                autoFocus
                sx={{
                  '& .MuiInputBase-input, & textarea': { color: '#111 !important', fontSize: 13 },
                  '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                  '& .MuiFormHelperText-root': { color: '#555' },
                }}
              />
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconButton size="small" onClick={saveText} color="success"><CheckIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => setEditingText(false)} color="error"><CloseIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#111', whiteSpace: 'pre-wrap', flex: 1, fontSize: 13, lineHeight: 1.5 }}>
              {d.type === 'action' ? getModuleLabel(d.text) : d.text}
            </Typography>
            <Tooltip title={d.type === 'action' ? "Elegir Módulo" : "Editar texto"}>
              <IconButton size="small" onClick={() => { setTextVal(d.text); setEditingText(true); }} sx={{ color: '#1976d2', flexShrink: 0 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Options list */}
      {d.options && d.options.length > 0 && (
        <Box>
          {d.options.map((opt, idx) => (
            <Box
              key={opt.id}
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.75,
                borderBottom: idx < (d.options?.length ?? 0) - 1 ? `1px solid ${meta.borderColor}22` : 'none',
                '&:hover .opt-actions': { opacity: 1 },
              }}
            >
              {editingOptId === opt.id ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
                  <TextField
                    size="small"
                    value={optVal}
                    onChange={e => setOptVal(e.target.value.substring(0, 24))}
                    autoFocus
                    helperText={`${optVal.length}/24`}
                    sx={{
                      flex: 1,
                      '& .MuiInputBase-input, & input': { color: '#111 !important', fontSize: 12, py: 0.5 },
                      '& .MuiOutlinedInput-root': { bgcolor: '#fff' },
                      '& .MuiFormHelperText-root': { color: '#555', fontSize: 11 },
                    }}
                  />
                  <IconButton size="small" onClick={() => saveOpt(opt.id)} color="success"><CheckIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => setEditingOptId(null)} color="error"><CloseIcon fontSize="small" /></IconButton>
                </Box>
              ) : (
                <>
                  <Box sx={{
                    flex: 1,
                    bgcolor: meta.borderColor + '18',
                    borderRadius: 1,
                    px: 1, py: 0.4,
                    border: `1px solid ${meta.borderColor}44`,
                    cursor: 'default',
                  }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#111', fontSize: 12 }}>
                      {opt.label}
                    </Typography>
                  </Box>
                  <Box className="opt-actions" sx={{ display: 'flex', ml: 0.5 }}>
                    <Tooltip title="Editar opción">
                      <IconButton size="small" onClick={() => startEditOpt(opt.id, opt.label)} sx={{ color: '#1976d2' }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar opción">
                      <IconButton size="small" onClick={() => d.onDeleteOption?.(opt.id)} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  {/* Outgoing handle per option */}
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={opt.id}
                    isConnectable={isConnectable}
                    style={{ background: meta.borderColor, width: 12, height: 12, right: -6, position: 'absolute' }}
                  />
                </>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Add option button (not for action/text) */}
      {(d.type === 'buttons' || d.type === 'list' || d.type === 'form') && (
        <Box sx={{ borderTop: `1px dashed ${meta.borderColor}66`, px: 1.5, py: 0.5 }}>
          <Tooltip title={d.type === 'form' ? "Agregar dato a solicitar" : "Agregar opción"}>
            <Box
              onClick={() => d.onAddOption?.()}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                cursor: 'pointer', opacity: 0.6,
                '&:hover': { opacity: 1 },
              }}
            >
              <AddIcon sx={{ fontSize: 14, color: meta.borderColor }} />
              <Typography variant="caption" sx={{ color: meta.borderColor, fontSize: 11 }}>
                {d.type === 'buttons' && (d.options?.length ?? 0) >= 3
                  ? 'Máx. 3 botones — usar Lista'
                  : d.type === 'form' ? 'Agregar variable a recolectar' : 'Agregar opción'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      )}

      {/* Default outgoing handle for text/action/form nodes */}
      {(d.type === 'text' || d.type === 'action' || d.type === 'form') && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: meta.borderColor, width: 12, height: 12, bottom: -6 }}
        />
      )}
    </Paper>
  );
}
