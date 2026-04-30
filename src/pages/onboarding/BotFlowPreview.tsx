import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Tooltip, IconButton, CircularProgress, Alert,
} from '@mui/material';
import {
  ReactFlow, Controls, Background, addEdge,
  applyNodeChanges, applyEdgeChanges, MarkerType,
  ReactFlowProvider, useReactFlow
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Add as AddIcon, Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon,
  Delete as DeleteIcon, Close as CloseIcon, AutoAwesome as AutoAwesomeIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon, Code as CodeIcon,
  Schema as SchemaIcon, Extension as ExtensionIcon,
  Save as SaveIcon, AutoFixHigh as AIActionIcon
} from '@mui/icons-material';
import MessageNode from './MessageNode';
import NoteNode from './NoteNode';
import FlowEdge from './FlowEdge';
import { settingsService } from '../../services/settingsService';
import { aiService } from '../../services/aiService';

interface BotFlowPreviewProps {
  botType: string;
  structuredData: any;
  setStructuredData: React.Dispatch<React.SetStateAction<any>>;
  onNext: () => void;
  onBack: () => void;
  viewMode?: boolean; // true = viewing existing bot, false/undefined = wizard step
}

const nodeTypes = { message: MessageNode, note: NoteNode };
const edgeTypes = { flow: FlowEdge };

// ─── Helpers ────────────────────────────────────────────────────────────────

// ─── Layout constants ────────────────────────────────────────────────────────
const COL_RESERVAS  = 50;
const COL_GESTION   = 520;
const COL_PRODUCTOS = 1000;
const COL_FAQ       = 1480;

function mkEdge(id: string, source: string, target: string, label: string, handle?: string): Edge {
  return {
    id, source, target, label,
    type: 'flow',
    sourceHandle: handle,
    markerEnd: { type: MarkerType.ArrowClosed },
  };
}

function buildInitialFlow(botType: string, structuredData: any): { n: Node[]; e: Edge[] } {
  const n: Node[] = [];
  const e: Edge[] = [];

  // ── Nodo de "cierre universal" ────────────────────────────────────────────
  // Reutilizado por TODAS las ramas: evita que el bot muera en silencio
  n.push({
    id: 'cierre_universal', type: 'message', position: { x: 650, y: 1800 },
    data: {
      type: 'buttons',
      text: '¿Puedo ayudarte con algo más? 😊',
      options: [
        { id: 'cu_si', label: '✅ Sí, volver al menú' },
        { id: 'cu_agente', label: '🙋 Hablar con alguien' },
      ],
    },
  });
  // ↪ "Sí" → vuelve al root
  e.push(mkEdge('e-cu-root', 'cierre_universal', 'root', 'Volver al menú', 'cu_si'));
  // ↪ "Agente" → derivación humana
  n.push({
    id: 'accion_agente', type: 'message', position: { x: 650, y: 2020 },
    data: { type: 'action', text: 'action_human_handoff' },
  });
  e.push(mkEdge('e-cu-agente', 'cierre_universal', 'accion_agente', 'Hablar con agente', 'cu_agente'));

  // ── Root menu ────────────────────────────────────────────────────────────
  const mainOptions: { id: string; label: string }[] = [];
  const hasReservas  = botType === 'reservas' || (structuredData.servicios?.length > 0);
  const hasProductos = structuredData.productos?.length > 0;
  const hasFaq       = structuredData.faq?.length > 0;

  if (hasReservas) {
    mainOptions.push({ id: 'opt_agendar',    label: '📅 Agendar Turno' });
    mainOptions.push({ id: 'opt_cancelar',   label: '❌ Cancelar Turno' });
    mainOptions.push({ id: 'opt_ver_turnos', label: '🔎 Ver Mis Turnos' });
  }
  if (hasProductos) mainOptions.push({ id: 'opt_productos', label: '🛍️ Ver Productos' });
  if (hasFaq)       mainOptions.push({ id: 'opt_faq',       label: '❓ Preguntas Frecuentes' });
  mainOptions.push({ id: 'opt_agente', label: '🙋 Hablar con alguien' });

  n.push({
    id: 'root', type: 'message', position: { x: 650, y: 50 },
    data: {
      type: mainOptions.length > 3 ? 'list' : 'buttons',
      text: `¡Hola! Bienvenido a ${structuredData.nombre || 'nuestro negocio'} 👋\n¿En qué te puedo ayudar hoy?`,
      options: mainOptions,
    },
  });
  // Siempre: "Hablar con alguien" desde el menú principal
  e.push(mkEdge('e-root-agente', 'root', 'accion_agente', 'Hablar con alguien', 'opt_agente'));

  // ═══════════════════════════════════════════════════════════════════════════
  // RAMA RESERVAS
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasReservas) {

    // 1) Menú de servicios
    const serviciosOptions = (structuredData.servicios || [{ nombre: 'Servicio General' }])
      .map((s: any, i: number) => ({ id: `serv_${i}`, label: s.nombre }));

    n.push({
      id: 'menu_servicios', type: 'message', position: { x: COL_RESERVAS, y: 300 },
      data: { type: 'list', text: '¿Qué servicio buscás?', options: serviciosOptions },
    });
    e.push(mkEdge('e-root-agendar', 'root', 'menu_servicios', 'Agendar Turno', 'opt_agendar'));

    // 2) Módulo: Consultar horarios disponibles
    n.push({
      id: 'accion_horarios', type: 'message', position: { x: COL_RESERVAS, y: 520 },
      data: { type: 'action', text: 'action_generate_dates' },
    });
    serviciosOptions.forEach((_: any, idx: number) => {
      e.push(mkEdge(`e-serv-${idx}`, 'menu_servicios', 'accion_horarios', structuredData.servicios?.[idx]?.nombre || `Servicio ${idx+1}`, `serv_${idx}`));
    });

    // 3) Formulario de datos del cliente
    n.push({
      id: 'form_datos', type: 'message', position: { x: COL_RESERVAS, y: 700 },
      data: {
        type: 'form',
        text: 'Nombre completo',
        options: [
          { id: 'campo_nombre',   label: 'Nombre completo' },
          { id: 'campo_telefono', label: 'Teléfono de contacto' },
        ],
      },
    });
    e.push(mkEdge('e-horarios-form', 'accion_horarios', 'form_datos', 'Al elegir horario'));

    // 4) Módulo: Confirmar reserva → guarda en DB
    n.push({
      id: 'accion_confirmar', type: 'message', position: { x: COL_RESERVAS, y: 900 },
      data: { type: 'action', text: 'action_confirm_booking' },
    });
    e.push(mkEdge('e-form-confirmar', 'form_datos', 'accion_confirmar', 'Al completar datos'));

    // 5) Confirmación final
    n.push({
      id: 'msg_confirmado', type: 'message', position: { x: COL_RESERVAS, y: 1050 },
      data: {
        type: 'buttons',
        text: '¡Listo! Tu turno ha sido agendado. Te esperamos.',
        options: [{ id: 'volver_inicio', label: 'Volver al Menú' }]
      },
    });
    e.push(mkEdge('e-confirmar-final', 'accion_confirmar', 'msg_confirmado', 'Al guardar'));
    e.push(mkEdge('e-final-volver', 'msg_confirmado', 'root', 'Volver al Menú', 'volver_inicio'));

    // ── Sub-rama: Cancelar turno ────────────────────────────────────────────
    n.push({
      id: 'accion_cancelar', type: 'message', position: { x: COL_GESTION, y: 300 },
      data: { type: 'action', text: 'action_cancel_booking' },
    });
    e.push(mkEdge('e-root-cancelar', 'root', 'accion_cancelar', 'Cancelar Turno', 'opt_cancelar'));

    n.push({
      id: 'msg_cancelar_ok', type: 'message', position: { x: COL_GESTION, y: 480 },
      data: { type: 'text', text: '✅ Tu turno fue cancelado correctamente. Podés agendar uno nuevo cuando quieras.' },
    });
    e.push(mkEdge('e-cancelar-ok', 'accion_cancelar', 'msg_cancelar_ok', 'Cancelación exitosa'));
    e.push(mkEdge('e-cancelar-cierre', 'msg_cancelar_ok', 'cierre_universal', '¿Algo más?'));

    // ── Sub-rama: Ver mis turnos ────────────────────────────────────────────
    n.push({
      id: 'accion_ver_turnos', type: 'message', position: { x: COL_GESTION, y: 660 },
      data: { type: 'action', text: 'action_view_bookings' },
    });
    e.push(mkEdge('e-root-ver', 'root', 'accion_ver_turnos', 'Ver Mis Turnos', 'opt_ver_turnos'));

    n.push({
      id: 'msg_ver_ok', type: 'message', position: { x: COL_GESTION, y: 840 },
      data: { type: 'text', text: '📋 Acá están tus próximos turnos. Si necesitás cancelar o modificar alguno, avisame.' },
    });
    e.push(mkEdge('e-ver-ok', 'accion_ver_turnos', 'msg_ver_ok', 'Listado enviado'));
    e.push(mkEdge('e-ver-cierre', 'msg_ver_ok', 'cierre_universal', '¿Algo más?'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAMA PRODUCTOS
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasProductos) {
    const prodOptions = (structuredData.productos || []).map((p: any, i: number) => ({
      id: `prod_${i}`, label: p.nombre?.substring(0, 24) || `Producto ${i+1}`,
    }));

    n.push({
      id: 'menu_productos', type: 'message', position: { x: COL_PRODUCTOS, y: 300 },
      data: { type: 'list', text: '🛍️ Acá tenés nuestros productos disponibles:', options: prodOptions },
    });
    e.push(mkEdge('e-root-productos', 'root', 'menu_productos', 'Ver Productos', 'opt_productos'));

    // Una tarjeta de detalle por producto
    let prodY = 520;
    (structuredData.productos || []).forEach((p: any, idx: number) => {
      const detId = `prod_det_${idx}`;
      const precio = p.precio ? ` — $${p.precio}` : '';
      const desc   = p.descripcion ? `\n${p.descripcion}` : '';
      n.push({
        id: detId, type: 'message', position: { x: COL_PRODUCTOS, y: prodY },
        data: {
          type: 'buttons',
          text: `${p.nombre}${precio}${desc}`,
          options: [{ id: `prod_comprar_${idx}`, label: '🛒 Consultar / Comprar' }],
        },
      });
      e.push(mkEdge(`e-prod-${idx}`, 'menu_productos', detId, p.nombre, `prod_${idx}`));
      // Consultar → derivar agente
      e.push(mkEdge(`e-prod-comprar-${idx}`, detId, 'accion_agente', 'Consultar', `prod_comprar_${idx}`));
      prodY += 220;
    });

    // Desde el último producto → cierre
    const lastProd = structuredData.productos?.[structuredData.productos.length - 1];
    if (lastProd) {
      const lastIdx = structuredData.productos.length - 1;
      e.push(mkEdge('e-prod-cierre', `prod_det_${lastIdx}`, 'cierre_universal', '¿Algo más?'));
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RAMA FAQ
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasFaq) {
    const faqOptions = (structuredData.faq || []).map((f: any, i: number) => ({
      id: `faq_${i}`,
      label: f.pregunta ? f.pregunta.substring(0, 22) + '…' : `Pregunta ${i+1}`,
    }));

    n.push({
      id: 'menu_faq', type: 'message', position: { x: COL_FAQ, y: 300 },
      data: { type: 'list', text: '❓ ¿Cuál es tu consulta?', options: faqOptions },
    });
    e.push(mkEdge('e-root-faq', 'root', 'menu_faq', 'Preguntas Frecuentes', 'opt_faq'));

    let faqY = 520;
    (structuredData.faq || []).forEach((f: any, idx: number) => {
      const ansId = `faq_ans_${idx}`;
      n.push({
        id: ansId, type: 'message', position: { x: COL_FAQ, y: faqY },
        data: {
          type: 'buttons',
          text: f.respuesta || 'Respuesta pendiente.',
          options: [{ id: `faq_mas_${idx}`, label: '🔙 Ver más preguntas' }],
        },
      });
      e.push(mkEdge(`e-faq-${idx}`, 'menu_faq', ansId, faqOptions[idx]?.label, `faq_${idx}`));
      // "Ver más preguntas" → vuelve al menú FAQ
      e.push(mkEdge(`e-faq-back-${idx}`, ansId, 'menu_faq', 'Ver más preguntas', `faq_mas_${idx}`));
      faqY += 260;
    });

    // FAQ siempre tiene opción de cierre desde el menú principal de FAQ
    n.push({
      id: 'faq_no_encontro', type: 'message', position: { x: COL_FAQ + 280, y: 400 },
      data: {
        type: 'buttons',
        text: '🤔 ¿No encontraste lo que buscabas? Te conectamos con alguien.',
        options: [
          { id: 'faq_agente_si', label: '🙋 Sí, quiero hablar' },
          { id: 'faq_agente_no', label: '🔙 Volver al menú' },
        ],
      },
    });
    e.push(mkEdge('e-faq-no-enc', 'menu_faq', 'faq_no_encontro', 'No encuentro mi pregunta'));
    e.push(mkEdge('e-faq-agente', 'faq_no_encontro', 'accion_agente', 'Quiero hablar', 'faq_agente_si'));
    e.push(mkEdge('e-faq-back-root', 'faq_no_encontro', 'root', 'Volver al menú', 'faq_agente_no'));
  }

  return { n, e };
}

// ─── Component ───────────────────────────────────────────────────────────────


export default function BotFlowPreview(props: BotFlowPreviewProps) {
  return (
    <ReactFlowProvider>
      <BotFlowPreviewInner {...props} />
    </ReactFlowProvider>
  );
}

function BotFlowPreviewInner({ botType, structuredData, setStructuredData, onNext, onBack, viewMode }: BotFlowPreviewProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  // Sidebar and Layout state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<'tools' | 'ai' | 'vars' | 'modules'>('tools');
  const [isChatOpen, setIsChatOpen] = useState(true); // Always open in sidebar context

  // AI Chat state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de configuración. Decime qué querés cambiar o agregar al bot y lo hago por vos.' }
  ]);
  const [systemModules, setSystemModules] = useState<{ id: string; label: string; category: string }[]>([]);

  useEffect(() => {
    import('../../services/systemService').then(({ systemService }) => {
      systemService.getModules().then(mods => setSystemModules(mods as any));
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar) return;
      setSidebarWidth(prev => {
        const newWidth = e.clientX;
        if (newWidth < 250) return 250;
        if (newWidth > 600) return 600;
        return newWidth;
      });
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    if (isResizingSidebar) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar]);

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
        const { onUpdateText, onUpdateOption, onDeleteOption, onAddOption, onDeleteNode, onDuplicateNode, onSelectType, onUpdateModule, ...cleanData } = original.data as any;
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
    onUpdateModule: (moduleId: string) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, moduleId } } : n));
    },
    onUpdateColor: (nodeColor: string) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, nodeColor } } : n));
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
    } as any, eds));
  }, [nodes]);

  // Drop a fresh "isNew" node at a visible center position
  const addNode = () => {
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

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    
    const newId = `node_${Date.now()}`;
    const defaultText: Record<string, string> = {
      text:    'Escribí la respuesta del bot aquí.',
      buttons: '¿Qué opción preferís?',
      list:    'Elegí una opción de la lista:',
      action:  'Módulo Interno',
      form:    'Pedir datos personales...',
    };
    const defaultOpts: Record<string, any[]> = {
      buttons: [{ id: `opt_${Date.now()}`, label: 'Opción 1' }],
      list:    [{ id: `opt_${Date.now()}`, label: 'Opción 1' }],
    };

    const newNode: Node = {
      id: newId,
      type: type === 'note' ? 'note' : 'message',
      position,
      data: buildNodeData(
        type === 'note' 
          ? { text: '' } 
          : {
            type,
            text: defaultText[type] || '',
            isNew: false,
            ...(defaultOpts[type] ? { options: defaultOpts[type] } : {}),
          }, 
        newId
      ),
    };

    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, buildNodeData]);

  const handleConfirmFlow = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      // Strip React callbacks before saving
      const cleanNodes = nodes
        .filter(n => !n.data?.isNew)  // skip placeholder nodes
        .map(n => {
          const { onUpdateText, onUpdateOption, onDeleteOption, onAddOption, onDeleteNode, onDuplicateNode, onSelectType, onUpdateModule, onUpdateColor, ...cleanData } = n.data as any;
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

  const handleAISubmit = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    const instruction = aiPrompt.trim();
    setAiPrompt('');
    setAiMessages(prev => [...prev, { role: 'user', content: instruction }]);
    setAiLoading(true);

    try {
      const nodesContext = nodes.map(n => ({
        id: n.id,
        texto: typeof n.data.text === 'string' ? n.data.text.substring(0, 50) : '',
        opciones: (n.data.options as any[] || []).map(o => ({ id: o.id, label: o.label }))
      }));

      const result = await aiService.processInstruction(instruction, nodesContext);
      
      let replyMessage = '';

      if (result.accion === 'desconocido') {
        replyMessage = result.descripcion || 'Solo puedo ayudarte a crear o mejorar tu bot. Por favor indicá qué querés que haga el bot.';
      } else {
        if ((result.accion === 'crear_nodo' || result.accion === 'editar_nodo') && result.nodo) {
          const newId = `ai_node_${Date.now()}`;
          const offset = nodes.length * 30;
          const mappedType = result.nodo.tipo === 'pregunta' ? 'text' 
                           : result.nodo.tipo === 'condicion' ? 'buttons' 
                           : result.nodo.tipo === 'api_call' ? 'action'
                           : 'text';
          
          let options: any[] = [];
          if (result.nodo.opciones && result.nodo.opciones.length > 0) {
            options = result.nodo.opciones.map((opt: string, i: number) => ({ id: `opt_${Date.now()}_${i}`, label: opt }));
          } else if (mappedType === 'buttons') {
            options = [{ id: `opt_${Date.now()}_1`, label: 'Sí' }, { id: `opt_${Date.now()}_2`, label: 'No' }];
          }

          const newNode: Node = {
            id: newId,
            type: 'message',
            position: { x: 300 + offset, y: 300 + offset },
            data: buildNodeData({
              type: options.length > 3 ? 'list' : options.length > 0 ? 'buttons' : mappedType,
              text: result.nodo.contenido || result.descripcion,
              options,
              isNew: false
            }, newId),
          };
          setNodes(nds => [...nds, newNode]);

          // Handle incoming edges
          if (Array.isArray(result.nodo.conexiones_entrantes_desde)) {
            const incomingEdges = result.nodo.conexiones_entrantes_desde.map((sourceId: string) => ({
              id: `e_${sourceId}_${newId}`,
              source: sourceId,
              target: newId,
              type: 'flow',
              markerEnd: { type: MarkerType.ArrowClosed }
            }));
            setEdges(eds => [...eds, ...incomingEdges]);
          }

          // Handle outgoing edges
          if (Array.isArray(result.nodo.conexiones_salientes)) {
            const outgoingEdges: any[] = [];
            result.nodo.conexiones_salientes.forEach((conn: any) => {
              const optMatch = options.find(o => o.label === conn.opcion);
              if (optMatch && conn.target_node_id) {
                outgoingEdges.push({
                  id: `e_${newId}_${conn.target_node_id}`,
                  source: newId,
                  sourceHandle: optMatch.id,
                  target: conn.target_node_id,
                  type: 'flow',
                  label: conn.opcion,
                  markerEnd: { type: MarkerType.ArrowClosed }
                });
              }
            });
            setEdges(eds => [...eds, ...outgoingEdges]);
          }

          replyMessage = `✅ ¡Listo! Generé el nodo: "${result.descripcion}" y lo dejé conectado según pediste.`;
        } else {
          replyMessage = `✅ Entendido. Acción: ${result.accion}. (Para evitar romper tu flujo, generá las acciones complejas desde los botones, o pedime crear nodos específicos)`;
        }
      }

      setAiMessages(prev => [...prev, { role: 'assistant', content: replyMessage }]);
    } catch (error) {
      setAiMessages(prev => [...prev, { role: 'assistant', content: '❌ Hubo un error al comunicarme con la IA. Intentá de nuevo.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // ── Canvas JSX ──
  const canvasContent = useMemo(() => (
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
        onDragOver={onDragOver}
        onDrop={onDrop}
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
          onClick={() => addNode()}
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
        {!isChatOpen && (
          <Button
            variant="contained"
            onClick={() => setIsChatOpen(true)}
            startIcon={<AutoAwesomeIcon />}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' } }}
          >
            Crear flujo con IA
          </Button>
        )}
        <Button
          variant="contained"
          color={viewMode ? 'success' : 'primary'}
          onClick={() => setConfirmDialogOpen(true)}
          disabled={saving}
          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 160 }}
        >
          {viewMode ? '💾 Guardar Cambios' : 'Confirmar Flujo'}
        </Button>
      </Box>

      {/* ─── Full-screen save overlay ─── */}
      {saving && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 99999,
          bgcolor: 'rgba(10, 10, 20, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
        }}>
          <Box sx={{
            bgcolor: '#1a1a2e', borderRadius: 4, px: 6, py: 5,
            border: '1px solid rgba(124,58,237,0.4)',
            boxShadow: '0 0 60px rgba(124,58,237,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5,
            minWidth: 320,
          }}>
            <CircularProgress size={56} thickness={4} sx={{ color: '#7c3aed' }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: '#e2d9f3' }}>
              {viewMode ? 'Guardando cambios…' : 'Creando tu bot…'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#888', textAlign: 'center', maxWidth: 260 }}>
              Estamos aplicando la nueva configuración del flujo.<br/>Esto toma solo unos segundos.
            </Typography>
          </Box>
        </Box>
      )}

      {/* ─── Result feedback toast ─── */}
      {saveResult === 'success' && (
        <Box sx={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99998, minWidth: 340,
        }}>
          <Alert
            severity="success"
            onClose={() => setSaveResult(null)}
            sx={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: 2,
              fontSize: 14, fontWeight: 600,
              '& .MuiAlert-icon': { fontSize: 22 },
            }}
          >
            ✅ Flujo guardado correctamente — el bot ya usa la nueva configuración.
          </Alert>
        </Box>
      )}
      {saveResult === 'error' && (
        <Box sx={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99998, minWidth: 340,
        }}>
          <Alert
            severity="error"
            onClose={() => setSaveResult(null)}
            sx={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: 2,
              fontSize: 14, fontWeight: 600,
              '& .MuiAlert-icon': { fontSize: 22 },
            }}
          >
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
  ), [nodes, edges, fullscreen, saving, saveResult, confirmDialogOpen, viewMode, onNodesChange, onEdgesChange, onConnect, onDragOver, onDrop]);

  const sidebarContent = useMemo(() => (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{
        width: sidebarOpen ? sidebarWidth : 40,
        height: '100%',
        bgcolor: '#1e1e2f',
        borderRight: '1px solid #333',
        transition: 'width 0.1s linear',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Toggle button */}
        <IconButton 
          size="small" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ 
            position: 'absolute', top: 10, right: sidebarOpen ? 10 : 5, 
            color: '#fff', bgcolor: '#333', '&:hover': { bgcolor: '#444' },
            zIndex: 100 
          }}
        >
          {sidebarOpen ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>

        {sidebarOpen && (
          <>
            {/* Sidebar Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid #333', mt: 4 }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Flow Studio</Typography>
              <Typography variant="caption" sx={{ color: '#aaa' }}>Gestioná el flujo de tu bot</Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ display: 'flex', borderBottom: '1px solid #333' }}>
               {[
                 { id: 'tools', icon: <SchemaIcon />, label: 'Herramientas' },
                 { id: 'ai', icon: <AutoAwesomeIcon />, label: 'IA' },
                 { id: 'vars', icon: <CodeIcon />, label: 'Variables' },
                 { id: 'modules', icon: <ExtensionIcon />, label: 'Módulos' }
               ].map(tab => (
                 <Tooltip key={tab.id} title={tab.label}>
                   <IconButton 
                    onClick={() => setActiveSection(tab.id as any)}
                    sx={{ 
                      flex: 1, borderRadius: 0, 
                      color: activeSection === tab.id ? '#7c3aed' : '#888',
                      borderBottom: activeSection === tab.id ? '2px solid #7c3aed' : 'none',
                      py: 1.5
                    }}
                   >
                     {tab.icon}
                   </IconButton>
                 </Tooltip>
               ))}
            </Box>

            {/* Section Content */}
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              p: 2,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#444', borderRadius: '10px' },
              '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#7c3aed' },
            }}>
              {activeSection === 'tools' && (
                <Box>
                  <Typography variant="overline" sx={{ color: '#7c3aed', fontWeight: 700 }}>Constructor</Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addNode}
                    sx={{ mt: 1, mb: 3, bgcolor: '#7c3aed', color: '#fff', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700 }}
                  >
                    Agregar Nuevo Nodo
                  </Button>

                  <Typography variant="overline" sx={{ color: '#7c3aed', fontWeight: 700 }}>Tipos de Nodo</Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                     {[
                       { id: 'text', label: 'Texto Simple', icon: '📝', desc: 'Respuesta directa de texto' },
                       { id: 'buttons', label: 'Botones Interactivos', icon: '🔘', desc: 'Hasta 3 opciones rápidas' },
                       { id: 'list', label: 'Lista de Opciones', icon: '📋', desc: 'Menú desplegable de opciones' },
                       { id: 'action', label: 'Módulo de Acción', icon: '⚙️', desc: 'Lógica interna del sistema' },
                       { id: 'form', label: 'Formulario IA', icon: '🧠', desc: 'Recolección inteligente de datos' },
                       { id: 'note', label: 'Nota Adhesiva', icon: '📌', desc: 'Anotaciones en el lienzo' }
                     ].map((t) => (
                       <Box 
                        key={t.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, t.id)}
                        sx={{ 
                          p: 1.5, bgcolor: '#2d2d44', borderRadius: 2, border: '1px solid #3d3d5a',
                          cursor: 'grab',
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: '#3d3d5a', borderColor: '#7c3aed', transform: 'translateX(5px)' },
                          '&:active': { cursor: 'grabbing' }
                        }}
                       >
                          <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{t.icon}</span> {t.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#aaa', fontSize: 11 }}>{t.desc}</Typography>
                       </Box>
                     ))}
                  </Box>
                </Box>
              )}

              {activeSection === 'ai' && (
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="overline" sx={{ color: '#7c3aed', fontWeight: 700, mb: 1 }}>Asistente Inteligente</Typography>
                  
                  {/* AI Messages List */}
                  <Box sx={{ 
                    flex: 1, 
                    bgcolor: '#0f0f1a', 
                    borderRadius: 2, 
                    p: 1.5, 
                    mb: 2, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1.5,
                    maxHeight: 'calc(100% - 150px)',
                    border: '1px solid #333'
                  }}>
                    {aiMessages.map((msg, i) => (
                      <Box key={i} sx={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        bgcolor: msg.role === 'user' ? '#7c3aed' : '#2d2d44', 
                        p: 1.2, 
                        borderRadius: 2, 
                        maxWidth: '90%' 
                      }}>
                        <Typography variant="body2" color="#fff" sx={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>
                          {msg.content}
                        </Typography>
                      </Box>
                    ))}
                    {aiLoading && (
                      <Box sx={{ alignSelf: 'flex-start', bgcolor: '#2d2d44', p: 1.2, borderRadius: 2 }}>
                        <CircularProgress size={14} sx={{ color: '#a78bfa' }} />
                      </Box>
                    )}
                  </Box>

                  {/* AI Input */}
                  <Box sx={{ mt: 'auto' }}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      maxRows={4}
                      placeholder="Ej: Agregá un menú de reclamos..."
                      variant="outlined"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAISubmit(); } }}
                      disabled={aiLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          bgcolor: '#2d2d44',
                          fontSize: 12,
                          '& fieldset': { borderColor: '#444' },
                          '&:hover fieldset': { borderColor: '#7c3aed' },
                          '&.Mui-focused fieldset': { borderColor: '#7c3aed' },
                        }
                      }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAISubmit}
                      disabled={aiLoading || !aiPrompt.trim()}
                      sx={{ mt: 1, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, textTransform: 'none', fontWeight: 700, fontSize: 13 }}
                    >
                      {aiLoading ? 'Procesando...' : 'Aplicar Cambios con IA'}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeSection === 'vars' && (
                <Box>
                  <Typography variant="overline" sx={{ color: '#7c3aed', fontWeight: 700 }}>Variables del Sistema</Typography>
                  <Typography variant="body2" sx={{ color: '#aaa', fontSize: 11, mb: 2 }}>
                    Usá estas etiquetas entre <code style={{ color: '#7c3aed' }}>{`{{}}`}</code> en cualquier texto.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                     {[
                       { var: 'perfil', label: 'Nombre del cliente' },
                       { var: 'negocio', label: 'Nombre del negocio' },
                       { var: 'hoy', label: 'Fecha actual' },
                       { var: 'saludo', label: 'Saludo (Buen día/etc)' },
                       { var: 'detalles_del_turno', label: 'Resumen del turno' }
                     ].map(v => (
                       <Box key={v.var} sx={{ p: 1, bgcolor: '#0f0f1a', borderRadius: 1, border: '1px solid #333' }}>
                          <Typography variant="body2" sx={{ color: '#7c3aed', fontWeight: 700, fontSize: 12 }}>{`{{${v.var}}}`}</Typography>
                          <Typography variant="caption" sx={{ color: '#888', fontSize: 10 }}>{v.label}</Typography>
                       </Box>
                     ))}
                  </Box>
                </Box>
              )}

              {activeSection === 'modules' && (
                <Box>
                  <Typography variant="overline" sx={{ color: '#7c3aed', fontWeight: 700 }}>Módulos Disponibles</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                     {systemModules.map(m => (
                       <Box key={m.id} sx={{ p: 1, bgcolor: '#2d2d44', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ExtensionIcon sx={{ fontSize: 14, color: m.category === 'data' ? '#ed6c02' : '#7c3aed' }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>{m.label}</Typography>
                            <Typography variant="caption" sx={{ color: '#aaa', fontSize: 10, textTransform: 'capitalize' }}>{m.category || 'Acción'}</Typography>
                          </Box>
                       </Box>
                     ))}
                  </Box>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Resizer Handle */}
        {sidebarOpen && (
          <Box
            onMouseDown={(e) => { e.preventDefault(); setIsResizingSidebar(true); }}
            sx={{
              width: 4,
              cursor: 'ew-resize',
              bgcolor: isResizingSidebar ? '#7c3aed' : '#222',
              '&:hover': { bgcolor: '#7c3aed' },
              zIndex: 20,
              transition: 'background-color 0.2s',
            }}
          />
        )}
      </Box>
    </Box>
  ), [sidebarOpen, sidebarWidth, isResizingSidebar, activeSection, aiMessages, aiLoading, aiPrompt, systemModules, addNode, onDragStart]);

  return (
    <>
      {/* Main Container */}
      <Box sx={{ display: 'flex', width: '100%', height: '85vh', border: '1px solid #333', borderRadius: 2, overflow: 'hidden', bgcolor: '#0f0f1a' }}>
        {/* Sidebar */}
        {sidebarContent}

        {/* Canvas Area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {canvasContent}
          {fullscreen && (
             <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, bgcolor: '#0f0f1a', display: 'flex' }}>
                {sidebarContent}
                <Box sx={{ flex: 1, position: 'relative' }}>
                   {canvasContent}
                </Box>
             </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
