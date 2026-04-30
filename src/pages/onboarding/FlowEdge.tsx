import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from '@xyflow/react';
import type { Position } from '@xyflow/react';
import { Close as CloseIcon } from '@mui/icons-material';

interface FlowEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  label?: string | React.ReactNode;
  selected?: boolean;
  [key: string]: any;
}

export default function FlowEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  label, selected,
}: FlowEdgeProps) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 12,
  });

  const strokeColor = selected ? '#f59e0b' : '#7c6fff';

  const onEdgeDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 4 : 2,
          transition: 'stroke 0.15s, stroke-width 0.15s',
          cursor: 'pointer',
        }}
        markerEnd={`url(#arrow-${selected ? 'sel' : 'def'})`}
      />

      <defs>
        <marker id="arrow-def" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#7c6fff" />
        </marker>
        <marker id="arrow-sel" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
      </defs>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {label && (
            <div style={{
              background: selected ? '#f59e0b' : '#3d2fa0',
              color: '#fff',
              border: `1px solid ${selected ? '#d97706' : '#7c6fff'}`,
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {String(label)}
            </div>
          )}
          
          {selected && (
            <button
              onClick={onEdgeDelete}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                padding: 0,
              }}
              title="Eliminar conexión"
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
