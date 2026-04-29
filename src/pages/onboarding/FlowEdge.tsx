import React from 'react';
import {
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react';
import type { Position } from '@xyflow/react';

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
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 12,
  });

  const isLoop = sourceX === targetX && sourceY === targetY;
  const strokeColor = selected ? '#f59e0b' : '#7c6fff';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 3 : 2,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
        markerEnd={`url(#arrow-${selected ? 'sel' : 'def'})`}
      />

      {/* SVG defs for arrowheads */}
      <defs>
        <marker id="arrow-def" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#7c6fff" />
        </marker>
        <marker id="arrow-sel" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
        </marker>
      </defs>

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
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
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
