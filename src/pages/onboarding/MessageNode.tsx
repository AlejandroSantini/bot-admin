import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { systemService } from '../../services/systemService';
import {
  Box, Typography, Paper, IconButton, Tooltip, TextField, Popover, Select, MenuItem, FormControl, useTheme
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
  moduleId?: string; // For dynamic lists or actions
  onUpdateText?: (text: string) => void;
  onUpdateOption?: (id: string, label: string) => void;
  onDeleteOption?: (id: string) => void;
  onAddOption?: () => void;
  onDeleteNode?: () => void;
  onDuplicateNode?: () => void;
  onSelectType?: (type: MessageNodeType) => void;
  onUpdateModule?: (moduleId: string) => void;
  nodeColor?: string;
  onUpdateColor?: (color: string) => void;
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

const SUGGESTIONS = [
  { var: 'perfil', label: 'Nombre del cliente', icon: '👤' },
  { var: 'negocio', label: 'Nombre del negocio', icon: '🏠' },
  { var: 'hoy', label: 'Fecha actual (DD/MM/AAAA)', icon: '📅' },
  { var: 'hora_actual', label: 'Hora actual', icon: '🕒' },
  { var: 'saludo', label: 'Saludo según horario', icon: '👋' },
  { var: 'detalles_del_turno', label: 'Resumen del turno reservado', icon: '📋' },
];

export default function MessageNode({ data, isConnectable }: MessageNodeProps) {
  const theme = useTheme();
  const d = data as MessageNodeData;
  const meta = TYPE_META[d.type] || TYPE_META.text;
  const nodeColor = d.nodeColor || meta.borderColor;
  const isDark = theme.palette.mode === 'dark';

  const [editingText, setEditingText] = useState(false);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [textVal, setTextVal] = useState(d.text);
  const [editingOptId, setEditingOptId] = useState<string | null>(null);
  const [optVal, setOptVal] = useState('');
  const [typeAnchor, setTypeAnchor] = useState<HTMLElement | null>(null);
  const [suggestionAnchor, setSuggestionAnchor] = useState<HTMLElement | null>(null);
  const [suggestionFilter, setSuggestionFilter] = useState('');
  const [cursorPos, setCursorPos] = useState<{ start: number, end: number } | null>(null);
  const textFieldRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [systemModules, setSystemModules] = useState<{id: string, label: string, category: string}[]>([]);

  useEffect(() => {
    systemService.getModules().then(mods => setSystemModules(mods as any));
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
      <Paper elevation={0} sx={{ width: 280, borderRadius: 1.5, overflow: 'hidden', border: '2px dashed #0f62fe', bgcolor: theme.palette.background.paper, boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(15, 98, 254, 0.08)' }}>
        <Handle type="target" position={Position.Top} isConnectable={isConnectable}
          style={{ background: '#0f62fe', width: 12, height: 12, top: -6 }} />
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" fontWeight="bold" sx={{ color: theme.palette.text.secondary }}>Nuevo nodo — Elegí el tipo:</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, p: 2 }}>
          {types.map(({ t, emoji, label }) => (
            <Box
              key={t}
              onClick={() => d.onSelectType?.(t)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1.5,
                border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
                p: 1.5,
                textAlign: 'center',
                bgcolor: isDark ? '#1a1a2e' : '#fafafa',
                transition: 'all .15s',
                '&:hover': { bgcolor: TYPE_META[t].borderColor + (isDark ? '33' : '11'), borderColor: TYPE_META[t].borderColor, transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
              }}
            >
              <Typography sx={{ fontSize: 24 }}>{emoji}</Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
        <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
          style={{ background: '#0f62fe', width: 12, height: 12, bottom: -6 }} />
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

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    const start = e.target.selectionStart || 0;
    const lastTwo = val.slice(0, start).slice(-2);
    
    setTextVal(val);

    if (lastTwo === '{{') {
      setSuggestionAnchor(e.target as any);
      setSuggestionFilter('');
      setCursorPos({ start, end: e.target.selectionEnd || start });
    } else if (suggestionAnchor) {
      // Basic filter logic: find text after {{
      const textBeforeCursor = val.slice(0, start);
      const lastOpening = textBeforeCursor.lastIndexOf('{{');
      if (lastOpening !== -1) {
        setSuggestionFilter(textBeforeCursor.slice(lastOpening + 2));
        setCursorPos({ start, end: e.target.selectionEnd || start });
      } else {
        setSuggestionAnchor(null);
        setCursorPos(null);
      }
    }
  };

  const insertVariable = (variable: string) => {
    if (!cursorPos) return;

    const { start, end } = cursorPos;
    
    setTextVal(prev => {
      const textBefore = prev.slice(0, start);
      const lastOpening = textBefore.lastIndexOf('{{');
      
      if (lastOpening !== -1) {
        const result = prev.slice(0, lastOpening) + `{{${variable}}}` + prev.slice(end);
        return result;
      }
      return prev;
    });

    setSuggestionAnchor(null);
    setCursorPos(null);
    
    // Return focus to text field
    setTimeout(() => {
      textFieldRef.current?.focus();
    }, 10);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        borderRadius: 1.5,
        overflow: 'visible',
        border: `1px solid ${nodeColor}`,
        bgcolor: theme.palette.background.paper,
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(0,0,0,0.06)',
        position: 'relative',
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.7)' : '0 12px 32px rgba(0,0,0,0.1)' }
      }}
    >
      {/* Incoming handle */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: nodeColor, width: 14, height: 14, top: -7, border: `2px solid ${theme.palette.background.paper}` }}
      />

      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 1.5, py: 0.75,
        bgcolor: nodeColor + '22',
        borderBottom: `1px solid ${nodeColor}44`,
      }}>
        {/* Clickable type badge */}
        <Tooltip title="Clic para cambiar tipo de nodo">
          <Box
            onClick={e => setTypeAnchor(e.currentTarget as HTMLElement)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              cursor: 'pointer', borderRadius: 1.5,
              px: 0.5, py: 0.25,
              '&:hover': { bgcolor: nodeColor + '33' },
            }}
          >
            {meta.icon}
            <Typography variant="caption" fontWeight="bold" sx={{ color: nodeColor }}>
              {meta.label}
            </Typography>
            <Typography variant="caption" sx={{ color: nodeColor, opacity: 0.6, fontSize: 10 }}>▼</Typography>
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
                  cursor: 'pointer', borderRadius: 1.5,
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

        {/* Duplicate + Color + Delete buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Tooltip title="Color del nodo">
            <IconButton
              size="small"
              onClick={(e) => setColorAnchor(e.currentTarget)}
              sx={{ color: nodeColor, '&:hover': { bgcolor: nodeColor + '22' } }}
            >
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: nodeColor, border: '1px solid #fff' }} />
            </IconButton>
          </Tooltip>
          
          <Popover
            open={Boolean(colorAnchor)}
            anchorEl={colorAnchor}
            onClose={() => setColorAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
              {['#adb5bd', '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7c3aed', '#9c27b0', '#c2185b'].map(c => (
                <Box
                  key={c}
                  onClick={() => { d.onUpdateColor?.(c); setColorAnchor(null); }}
                  sx={{ 
                    width: 24, height: 24, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                    border: nodeColor === c ? '2px solid #000' : '1px solid #eee',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Box>
          </Popover>

          <Tooltip title="Duplicar nodo">
            <IconButton
              size="small"
              onClick={() => d.onDuplicateNode?.()}
              sx={{ color: nodeColor, '&:hover': { bgcolor: nodeColor + '22' } }}
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
              <FormControl size="small" fullWidth className="nodrag">
                <Select
                  value={systemModules.some(m => m.id === textVal) ? textVal : (systemModules[0]?.id || '')}
                  onChange={e => setTextVal(e.target.value as string)}
                  sx={{ bgcolor: theme.palette.background.default, fontSize: 13, '& .MuiSelect-select': { color: `${theme.palette.text.primary} !important`, py: 1 } }}
                  displayEmpty
                  MenuProps={{ style: { zIndex: 10001 } }}
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
                onChange={handleTextChange}
                inputRef={textFieldRef}
                autoFocus
                placeholder="Ej: Pedir datos personales..."
                helperText="El backend iterará sobre las variables"
                sx={{
                  '& .MuiInputBase-input, & textarea': { color: `${theme.palette.text.primary} !important`, fontSize: 13 },
                  '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default },
                  '& .MuiFormHelperText-root': { color: theme.palette.text.secondary },
                }}
              />
            ) : (
              <TextField
                size="small"
                multiline
                rows={3}
                fullWidth
                value={textVal}
                onChange={handleTextChange}
                inputRef={textFieldRef}
                autoFocus
                placeholder="Usá {{ para insertar variables"
                sx={{
                  '& .MuiInputBase-input, & textarea': { color: `${theme.palette.text.primary} !important`, fontSize: 13, lineHeight: 1.5 },
                  '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default, borderRadius: 1.5 },
                  '& .MuiFormHelperText-root': { color: theme.palette.text.secondary },
                }}
              />
            )}
            
            {/* Variables Suggestions Popover */}
            <Popover
              open={Boolean(suggestionAnchor)}
              anchorEl={suggestionAnchor}
              onClose={() => setSuggestionAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              disableAutoFocus
              disableEnforceFocus
              sx={{ 
                pointerEvents: 'none', 
                '& .MuiPaper-root': { 
                  pointerEvents: 'auto', 
                  mt: 1, 
                  maxHeight: 280, 
                  width: 300,
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  bgcolor: '#fff'
                } 
              }}
            >
              <Box sx={{ p: 1.5, bgcolor: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#1976d2', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 10 }}>
                  Variables disponibles
                </Typography>
              </Box>
              <Box sx={{ overflowY: 'auto', maxHeight: 240 }}>
                {SUGGESTIONS.filter(s => s.var.includes(suggestionFilter.toLowerCase()) || s.label.toLowerCase().includes(suggestionFilter.toLowerCase())).map(s => (
                  <MenuItem 
                    key={s.var} 
                    onClick={() => insertVariable(s.var)} 
                    sx={{ 
                      py: 1.5, 
                      px: 2, 
                      transition: 'all 0.2s',
                      borderBottom: '1px solid #f9f9f9',
                      '&:hover': { bgcolor: '#f0f4ff' },
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Box sx={{ 
                        width: 36, height: 36, borderRadius: '8px', bgcolor: '#f0f4ff', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 
                      }}>
                        {s.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="700" sx={{ color: theme.palette.text.primary, fontSize: 13, mb: 0.2 }}>
                          {`{{${s.var}}}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: 11, display: 'block', lineHeight: 1.2 }}>
                          {s.label}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Box>
              {SUGGESTIONS.filter(s => s.var.includes(suggestionFilter.toLowerCase()) || s.label.toLowerCase().includes(suggestionFilter.toLowerCase())).length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>No se encontraron variables</Typography>
                </Box>
              )}
            </Popover>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
              <IconButton size="small" onClick={saveText} color="success"><CheckIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => setEditingText(false)} color="error"><CloseIcon fontSize="small" /></IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5 }}>
                {d.type === 'action' ? getModuleLabel(d.text) : d.text}
              </Typography>
              {d.type === 'list' && d.moduleId && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#ed6c0211', border: '1px solid #ed6c0244', borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight="bold" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ActionIcon sx={{ fontSize: 12 }} /> Módulo dinámico:
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                    {getModuleLabel(d.moduleId)}
                  </Typography>
                </Box>
              )}
            </Box>
            <Tooltip title={d.type === 'action' ? "Elegir Módulo" : "Editar texto"}>
              <IconButton size="small" onClick={() => { setTextVal(d.text); setEditingText(true); }} sx={{ color: '#1976d2', flexShrink: 0 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Dynamic Module Info (if any) */}
      {d.type === 'list' && d.moduleId && (
        <Box sx={{ p: 1.5, pt: 0, borderBottom: d.options?.length ? `1px solid ${meta.borderColor}22` : 'none' }}>
           <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
             Opciones generadas por módulo (se muestran primero).
           </Typography>
           <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <ButtonIcon fontSize="small" sx={{ color: '#ed6c02', opacity: 0.6, cursor: 'pointer', '&:hover': { opacity: 1 } }} 
                onClick={() => d.onUpdateModule?.('')}
              />
              <Typography variant="caption" onClick={() => d.onUpdateModule?.('')} sx={{ ml: 1, color: '#1976d2', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Quitar módulo
              </Typography>
           </Box>
           <Handle type="source" position={Position.Right} id="dynamic_out" isConnectable={isConnectable} style={{ background: meta.borderColor, width: 12, height: 12, right: -6 }} />
        </Box>
      )}

      {/* Static options list */}
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
                      '& .MuiInputBase-input, & input': { color: `${theme.palette.text.primary} !important`, fontSize: 12, py: 0.5 },
                      '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.default },
                      '& .MuiFormHelperText-root': { color: theme.palette.text.secondary, fontSize: 11 },
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
                    borderRadius: 1.5,
                    px: 1, py: 0.4,
                    border: `1px solid ${meta.borderColor}44`,
                    cursor: 'default',
                  }}>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: theme.palette.text.primary, fontSize: 12 }}>
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
        <Box sx={{ borderTop: `1px dashed ${meta.borderColor}66`, px: 1.5, py: 0.5, display: 'flex', justifyContent: 'space-between' }}>
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

          {d.type === 'list' && !d.moduleId && (
            <Tooltip title="Usar un módulo para obtener opciones dinámicamente">
               <Box 
                onClick={(e) => {
                  // We can use a simple prompt or a popover for module selection.
                  // For now, let's show a select below or something.
                  // Let's just set a flag to show the module selector.
                  setEditingOptId('DYNAMIC_SELECT');
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', opacity: 0.6, '&:hover': { opacity: 1 } }}
               >
                 <ActionIcon sx={{ fontSize: 14, color: '#ed6c02' }} />
                 <Typography variant="caption" sx={{ color: '#ed6c02', fontSize: 11 }}>Dinámico</Typography>
               </Box>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Dynamic Module Selector inside List node */}
      {editingOptId === 'DYNAMIC_SELECT' && (
        <Box sx={{ p: 1.5, borderTop: `1px solid ${meta.borderColor}22`, bgcolor: '#ed6c0208' }}>
          <Typography variant="caption" fontWeight="bold" sx={{ color: '#ed6c02', mb: 0.5, display: 'block' }}>Elegí el módulo de datos:</Typography>
          <FormControl size="small" fullWidth className="nodrag">
            <Select
              value={d.moduleId || ''}
              onChange={e => { d.onUpdateModule?.(e.target.value as string); setEditingOptId(null); }}
              sx={{ bgcolor: '#fff', fontSize: 12, '& .MuiSelect-select': { color: '#111', py: 0.5 } }}
              displayEmpty
              MenuProps={{ style: { zIndex: 10001 } }}
            >
              <MenuItem value="" disabled>Seleccionar módulo...</MenuItem>
              {systemModules.filter(m => !m.category || m.category === 'data').map((m) => (
                <MenuItem key={m.id} value={m.id}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
             <IconButton size="small" onClick={() => setEditingOptId(null)} color="error"><CloseIcon fontSize="small" /></IconButton>
          </Box>
        </Box>
      )}

      {/* Default outgoing handle for text/action/form nodes */}
      {(d.type === 'text' || d.type === 'action' || d.type === 'form') && (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ background: nodeColor, width: 12, height: 12, bottom: -6 }}
        />
      )}
    </Paper>
  );
}
