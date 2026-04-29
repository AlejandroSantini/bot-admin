import React, { useCallback, useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Tooltip, IconButton, CircularProgress, Alert,
} from '@mui/material';
import {
  ReactFlow, Controls, Background, addEdge,
  applyNodeChanges, applyEdgeChanges, MarkerType,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Add as AddIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MessageNode from './MessageNode';
import FlowEdge from './FlowEdge';
import { settingsService } from '../../services/settingsService';

interface BotFlowPreviewProps {
  botType: string;
  structuredData: any;
  setStructuredData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  viewMode?: boolean; // true = viewing existing bot, false/undefined = wizard step
}

const nodeTypes = { message: MessageNode };
const edgeTypes = { flow: FlowEdge };

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildInitialFlow(botType: string, structuredData: any): { n: Node[]; e: Edge[] } {
  const n: Node[] = [];
  const e: Edge[] = [];

  // ── Root menu ──
  const mainOptions: { id: string; label: string }[] = [];
  if (botType === 'reservas' || (structuredData.servicios?.length > 0)) {
    mainOptions.push({ id: 'opt_agendar',    label: 'Agendar Turno' });
    mainOptions.push({ id: 'opt_cancelar',   label: 'Cancelar Turno' });
    mainOptions.push({ id: 'opt_ver_turnos', label: 'Ver Mis Turnos' });
  }
  if (structuredData.productos?.length > 0) mainOptions.push({ id: 'opt_productos', label: 'Ver Productos' });
  if (structuredData.faq?.length > 0)       mainOptions.push({ id: 'opt_faq', label: 'Preguntas Frecuentes' });

  n.push({
    id: 'root', type: 'message', position: { x: 500, y: 50 },
    data: {
      type: mainOptions.length > 3 ? 'list' : 'buttons',
      text: `¡Hola! Bienvenido a ${structuredData.nombre || 'nuestro negocio'}. ¿En qué te podemos ayudar hoy?`,
      options: mainOptions,
    },
  });

  // ── Booking flow ──
  if (botType === 'reservas' || structuredData.servicios?.length > 0) {
    n.push({
      id: 'menu_servicios', type: 'message', position: { x: 50, y: 280 },
      data: {
        type: 'list',
        text: 'Elegí el servicio que buscás:',
        options: (structuredData.servicios || []).map((s: any, i: number) => ({ id: `serv_${i}`, label: s.nombre })),
      },
    });
    e.push({ id: 'e-root-agendar', source: 'root', sourceHandle: 'opt_agendar', target: 'menu_servicios', type: 'flow', label: 'Agendar Turno', markerEnd: { type: MarkerType.ArrowClosed } });

    // Cancelar/Ver → same module
    n.push({
      id: 'accion_gestion', type: 'message', position: { x: 550, y: 280 },
      data: { type: 'action', text: 'Módulo: Gestión de Turnos (Cancelar / Ver reservas)' },
    });
    e.push({ id: 'e-cancelar', source: 'root', sourceHandle: 'opt_cancelar', target: 'accion_gestion', type: 'flow', label: 'Cancelar Turno', markerEnd: { type: MarkerType.ArrowClosed } });
    e.push({ id: 'e-ver',      source: 'root', sourceHandle: 'opt_ver_turnos', target: 'accion_gestion', type: 'flow', label: 'Ver Mis Turnos', markerEnd: { type: MarkerType.ArrowClosed } });

    // Date picker
    n.push({
      id: 'menu_fechas', type: 'message', position: { x: 50, y: 520 },
      data: {
        type: 'list',
        text: 'Estos son los horarios disponibles más próximos:',
        options: [
          { id: 'f_1',      label: 'Miércoles 29/04 - 10:00h' },
          { id: 'f_2',      label: 'Miércoles 29/04 - 10:30h' },
          { id: 'f_3',      label: 'Miércoles 29/04 - 11:00h' },
          { id: 'f_4',      label: 'Miércoles 29/04 - 11:30h' },
          { id: 'f_5',      label: 'Jueves 30/04 - 09:00h' },
          { id: 'f_more',   label: '🔄 Ver más horarios' },
          { id: 'f_manual', label: '✍️ Ingresar Manualmente' },
        ],
      },
    });
    (structuredData.servicios || []).forEach((s: any, idx: number) => {
      e.push({ id: `e-serv-${idx}`, source: 'menu_servicios', sourceHandle: `serv_${idx}`, target: 'menu_fechas', type: 'flow', label: s.nombre, markerEnd: { type: MarkerType.ArrowClosed } });
    });
    // Self-loop "ver más"
    e.push({ id: 'e-more', source: 'menu_fechas', sourceHandle: 'f_more', target: 'menu_fechas', type: 'flow', label: 'Ver más horarios', markerEnd: { type: MarkerType.ArrowClosed } });

    // Manual entry
    n.push({
      id: 'ingreso_manual', type: 'message', position: { x: -350, y: 720 },
      data: { type: 'text', text: 'Por favor ingresá la fecha y hora que buscás\n(Ej: 30 de abril a las 15hs)' },
    });
    e.push({ id: 'e-manual-in', source: 'menu_fechas', sourceHandle: 'f_manual', target: 'ingreso_manual', type: 'flow', label: 'Ingresar Manualmente', markerEnd: { type: MarkerType.ArrowClosed } });

    // Confirm
    n.push({
      id: 'accion_confirmar', type: 'message', position: { x: 50, y: 800 },
      data: { type: 'action', text: 'Módulo: Confirmar Reserva y/o Seña' },
    });
    const fechaLabels: Record<string,string> = {
      f_1: 'Miércoles 29/04 - 10:00h', f_2: 'Miércoles 29/04 - 10:30h',
      f_3: 'Miércoles 29/04 - 11:00h', f_4: 'Miércoles 29/04 - 11:30h',
      f_5: 'Jueves 30/04 - 09:00h',
    };
    ['f_1','f_2','f_3','f_4','f_5'].forEach(opt => {
      e.push({ id: `e-fecha-${opt}`, source: 'menu_fechas', sourceHandle: opt, target: 'accion_confirmar', type: 'flow', label: fechaLabels[opt], markerEnd: { type: MarkerType.ArrowClosed } });
    });
    e.push({ id: 'e-manual-ok', source: 'ingreso_manual', target: 'accion_confirmar', type: 'flow', label: 'Si está libre', markerEnd: { type: MarkerType.ArrowClosed } });

    // Error loop
    n.push({
      id: 'error_manual', type: 'message', position: { x: -350, y: 950 },
      data: {
        type: 'buttons',
        text: 'Ese horario está ocupado o el formato no es válido. Intentá de nuevo.',
        options: [{ id: 'opt_reintentar', label: 'Intentar otra vez' }],
      },
    });
    e.push({ id: 'e-manual-err', source: 'ingreso_manual', target: 'error_manual', type: 'flow', label: 'Si está ocupado', markerEnd: { type: MarkerType.ArrowClosed } });
    e.push({ id: 'e-retry', source: 'error_manual', sourceHandle: 'opt_reintentar', target: 'ingreso_manual', type: 'flow', label: 'Intentar otra vez', markerEnd: { type: MarkerType.ArrowClosed } });
  }

  // ── Products ──
  if (structuredData.productos?.length > 0) {
    n.push({
      id: 'menu_productos', type: 'message', position: { x: 950, y: 280 },
      data: {
        type: 'list',
        text: 'Acá tenés nuestros productos disponibles:',
        options: (structuredData.productos || []).map((p: any, i: number) => ({ id: `prod_${i}`, label: p.nombre })),
      },
    });
    e.push({ id: 'e-productos', source: 'root', sourceHandle: 'opt_productos', target: 'menu_productos', type: 'flow', label: 'Ver Productos', markerEnd: { type: MarkerType.ArrowClosed } });
  }

  // ── FAQ ──
  if (structuredData.faq?.length > 0) {
    const faqOptions = (structuredData.faq || []).map((f: any, i: number) => ({
      id: `faq_${i}`,
      label: f.pregunta ? f.pregunta.substring(0, 22) + '…' : 'Pregunta',
    }));
    n.push({
      id: 'menu_faq', type: 'message', position: { x: 1300, y: 280 },
      data: { type: 'list', text: 'Te ayudo con tus dudas frecuentes:', options: faqOptions },
    });
    e.push({ id: 'e-faq', source: 'root', sourceHandle: 'opt_faq', target: 'menu_faq', type: 'flow', label: 'Preguntas Frecuentes', markerEnd: { type: MarkerType.ArrowClosed } });

    let faqY = 500;
    (structuredData.faq || []).forEach((f: any, idx: number) => {
      const ansId = `faq_ans_${idx}`;
      n.push({ id: ansId, type: 'message', position: { x: 1300, y: faqY }, data: { type: 'text', text: f.respuesta } });
      e.push({ id: `e-faq-${idx}`, source: 'menu_faq', sourceHandle: `faq_${idx}`, target: ansId, type: 'flow', label: faqOptions[idx]?.label, markerEnd: { type: MarkerType.ArrowClosed } });
      faqY += 180;
    });
  }

  return { n, e };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BotFlowPreview({ botType, structuredData, setStructuredData, onNext, onBack, viewMode }: BotFlowPreviewProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  // ── Build callbacks injected into every node's data ──
  const buildNodeData = useCallback((rawData: any, nodeId: string) => ({
    ...rawData,
    onUpdateText: (text: string) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, text } } : n));
    },
    onUpdateOption: (optId: string, label: string) => {
      setNodes(nds => nds.map(n => {
        if (n.id !== nodeId) return n;
        return { ...n, data: { ...n.data, options: (n.data.options as any[]).map((o: any) => o.id === optId ? { ...o, label } : o) } };
      }));
    },
    onDeleteOption: (optId: string) => {
      setNodes(nds => nds.map(n => {
        if (n.id !== nodeId) return n;
        const opts = ((n.data.options as any[]) || []).filter((o: any) => o.id !== optId);
        return { ...n, data: { ...n.data, options: opts, type: opts.length <= 3 ? 'buttons' : 'list' } };
      }));
      setEdges(eds => eds.filter(ed => ed.sourceHandle !== optId));
    },
    onAddOption: () => {
      const newOptId = `opt_${Date.now()}`;
      setNodes(nds => nds.map(n => {
        if (n.id !== nodeId) return n;
        const opts = [...((n.data.options as any[]) || []), { id: newOptId, label: 'Nueva opción' }];
        return { ...n, data: { ...n.data, options: opts, type: opts.length > 3 ? 'list' : 'buttons' } };
      }));
    },
    onDeleteNode: () => {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(ed => ed.source !== nodeId && ed.target !== nodeId));
    },
    onDuplicateNode: () => {
      setNodes(nds => {
        const original = nds.find(n => n.id === nodeId);
        if (!original) return nds;
        const cloneId = `clone_${Date.now()}`;
        // Strip callbacks from data before cloning, then re-inject
        const { onUpdateText, onUpdateOption, onDeleteOption, onAddOption, onDeleteNode, onDuplicateNode, onSelectType, ...cleanData } = original.data as any;
        // Deep-clone options with fresh IDs to avoid handle conflicts
        const freshOpts = (cleanData.options || []).map((o: any) => ({ ...o, id: `opt_${Date.now()}_${Math.random().toString(36).slice(2,6)}` }));
        const cloneRaw = { ...cleanData, options: freshOpts };
        const cloneNode: Node = {
          ...original,
          id: cloneId,
          position: { x: original.position.x + 60, y: original.position.y + 60 },
          data: buildNodeData(cloneRaw, cloneId),
        };
        return [...nds, cloneNode];
      });
    },
    onSelectType: (type: string) => {
      // Promote isNew node to real node with the chosen type
      setNodes(nds => nds.map(n => {
        if (n.id !== nodeId) return n;
        const defaultText: Record<string, string> = {
          text:    'Escribí la respuesta del bot aquí.',
          buttons: '¿Qué opción preferís?',
          list:    'Elegí una opción de la lista:',
          action:  'Módulo Interno',
        };
        const defaultOpts: Record<string, any[]> = {
          buttons: [{ id: `opt_${Date.now()}`, label: 'Opción 1' }],
          list:    [{ id: `opt_${Date.now()}`, label: 'Opción 1' }],
        };
        const newData = {
          type,
          text: defaultText[type] || '',
          isNew: false,
          ...(defaultOpts[type] ? { options: defaultOpts[type] } : {}),
        };
        return { ...n, data: buildNodeData(newData, n.id) };
      }));
    },
  }), []);

  // ── Re-inject callbacks whenever nodes change ──
  const injectCallbacks = useCallback((rawNodes: Node[]): Node[] =>
    rawNodes.map(n => ({ ...n, data: buildNodeData(n.data, n.id) })),
  [buildNodeData]);

  useEffect(() => {
    if (structuredData.flow_definition) {
      setNodes(injectCallbacks(structuredData.flow_definition.nodes));
      setEdges(structuredData.flow_definition.edges);
      return;
    }
    const { n, e } = buildInitialFlow(botType, structuredData);
    setNodes(injectCallbacks(n));
    setEdges(e);
  }, []); // intentionally run once on mount

  const onNodesChange = useCallback((changes: any) => setNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection | Edge) => {
    // Try to find the option label for the source handle to auto-label the edge
    const sourceNode = nodes.find(n => n.id === params.source);
    const sourceOpts: any[] = (sourceNode?.data?.options as any[]) || [];
    const matchedOpt = sourceOpts.find((o: any) => o.id === params.sourceHandle);
    const edgeLabel = matchedOpt?.label || undefined;
    setEdges(eds => addEdge({
      ...params,
      type: 'flow',
      label: edgeLabel,
      markerEnd: { type: MarkerType.ArrowClosed },
    }, eds));
  }, [nodes]);

  // Drop a fresh "isNew" node at a visible center position
  const handleDropNewNode = () => {
    const newId = `node_${Date.now()}`;
    // Offset slightly each time so nodes don't stack perfectly
    const offset = nodes.length * 30;
    const newNode: Node = {
      id: newId,
      type: 'message',
      position: { x: 300 + offset, y: 300 + offset },
      data: buildNodeData({ type: 'text', text: '', isNew: true }, newId),
    };
    setNodes(nds => [...nds, newNode]);
  };

  const handleConfirmFlow = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      // Strip React callbacks before saving
      const cleanNodes = nodes
        .filter(n => !n.data?.isNew)  // skip placeholder nodes
        .map(n => {
          const { onUpdateText, onUpdateOption, onDeleteOption, onAddOption, onDeleteNode, onDuplicateNode, onSelectType, ...cleanData } = n.data as any;
          return { ...n, data: cleanData };
        });

      // 1. Persist to DB so the bot uses the new flow immediately
      await settingsService.saveFlowDefinition(cleanNodes, edges);

      // 2. Also update local structuredData so the canvas reloads from it
      setStructuredData((prev: any) => ({ ...prev, flow_definition: { nodes: cleanNodes, edges } }));

      setSaveResult('success');
      setConfirmDialogOpen(false);

      // If this is the first save (wizard mode), advance the stepper
      if (!viewMode) onNext();
    } catch (err) {
      console.error('[BotFlowPreview] Error saving flow:', err);
      setSaveResult('error');
    } finally {
      setSaving(false);
    }
  };

  // ── Canvas JSX ──
  const canvasContent = (
    <Box sx={{
      width: '100%', height: '100%', position: 'relative',
      '& .react-flow__controls button': { bgcolor: '#1e1e2f', fill: '#aaa', border: '1px solid #333', '&:hover': { bgcolor: '#2d2d44' } },
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background color="#444" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Top toolbar */}
      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1, zIndex: 20 }}>
        <Button
          variant="contained" size="small"
          startIcon={<AddIcon />}
          onClick={() => handleDropNewNode()}
          sx={{ bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700 }}
        >
          Agregar Nodo
        </Button>
        <Tooltip title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
          <IconButton
            onClick={() => setFullscreen(f => !f)}
            sx={{ bgcolor: '#1e1e2f', color: '#aaa', border: '1px solid #333', '&:hover': { bgcolor: '#2d2d44', color: '#fff' } }}
          >
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Bottom toolbar */}
      <Box sx={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 1.5, zIndex: 20 }}>
        {!viewMode && (
          <Button variant="outlined" onClick={onBack} sx={{ bgcolor: '#fff', textTransform: 'none' }}>Atrás</Button>
        )}
        <Button
          variant="contained"
          color={viewMode ? 'success' : 'primary'}
          onClick={() => setConfirmDialogOpen(true)}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 160 }}
        >
          {saving ? 'Guardando...' : viewMode ? '💾 Guardar Cambios' : 'Confirmar Flujo'}
        </Button>
      </Box>

      {/* Save result feedback */}
      {saveResult === 'success' && (
        <Box sx={{ position: 'absolute', bottom: 60, right: 12, zIndex: 20 }}>
          <Alert severity="success" onClose={() => setSaveResult(null)} sx={{ boxShadow: 3 }}>
            ✅ Flujo guardado — el bot ya usa la nueva configuración
          </Alert>
        </Box>
      )}
      {saveResult === 'error' && (
        <Box sx={{ position: 'absolute', bottom: 60, right: 12, zIndex: 20 }}>
          <Alert severity="error" onClose={() => setSaveResult(null)} sx={{ boxShadow: 3 }}>
            ❌ Error al guardar el flujo. Reintentá en unos segundos.
          </Alert>
        </Box>
      )}

      {/* ── Confirm dialog ── */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="xs" fullWidth
        sx={{ zIndex: 10000 }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {viewMode ? '💾 Guardar cambios en el flujo' : '✅ Confirmar y Crear Bot'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {viewMode
              ? 'Se guardarán todos los cambios que hiciste al flujo del bot activo.'
              : <>El bot será creado con el flujo que acabás de estructurar. <strong>Podrás editarlo en cualquier momento</strong> desde la sección de configuración.</>
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmFlow} variant="contained" color="success">
            {viewMode ? 'Guardar' : 'Crear Bot'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <>
      {/* Normal canvas */}
      <Box sx={{ width: '100%', height: '75vh', border: '1px solid #333', borderRadius: 2, overflow: 'hidden', bgcolor: '#0f0f1a' }}>
        {!fullscreen && canvasContent}
      </Box>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 9999,
          bgcolor: '#0f0f1a',
          display: 'flex', flexDirection: 'column',
        }}>
          {canvasContent}
        </Box>
      )}
    </>
  );
}
