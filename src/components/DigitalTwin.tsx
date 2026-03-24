import React from 'react';
import { Box, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface DigitalTwinProps {
  highlightedAsset?: string; // task_id to highlight
  taskName?: string;
}

// Simplified EPC plant layout as SVG
const ASSETS = [
  { id: 'T-101', label: 'Turbine', x: 280, y: 60, w: 100, h: 70, type: 'equipment' },
  { id: 'T-102', label: 'Cooling', x: 420, y: 120, w: 80, h: 60, type: 'piping' },
  { id: 'T-103', label: 'Foundation', x: 160, y: 160, w: 120, h: 50, type: 'civil' },
  { id: 'T-104', label: 'Electrical', x: 340, y: 180, w: 90, h: 55, type: 'electrical' },
];

const CONNECTIONS = [
  { from: 'T-103', to: 'T-101' },
  { from: 'T-101', to: 'T-102' },
  { from: 'T-101', to: 'T-104' },
];

function getAssetCenter(id: string) {
  const a = ASSETS.find(a => a.id === id);
  if (!a) return { cx: 0, cy: 0 };
  return { cx: a.x + a.w / 2, cy: a.y + a.h / 2 };
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ highlightedAsset, taskName }) => {
  return (
    <div className="p-5 bg-white rounded-xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Box className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Digital Twin — Asset View</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Hexagon Smart 3D / AVEVA E3D</span>
          </div>
        </div>
        {highlightedAsset && (
          <span className="px-2 py-1 bg-red-50 border border-red-200 rounded text-[9px] font-bold uppercase text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Asset At Risk
          </span>
        )}
      </div>

      <div className="relative bg-zinc-950 rounded-xl overflow-hidden" style={{ height: 280 }}>
        {/* Grid overlay */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg viewBox="0 0 580 280" className="relative w-full h-full">
          {/* Ground plane */}
          <polygon points="40,240 540,240 500,260 80,260" fill="#1a1a2e" stroke="#334155" strokeWidth="0.5" />

          {/* Connection lines */}
          {CONNECTIONS.map((conn, i) => {
            const from = getAssetCenter(conn.from);
            const to = getAssetCenter(conn.to);
            const isHighlighted = highlightedAsset === conn.from || highlightedAsset === conn.to;
            return (
              <line
                key={i}
                x1={from.cx} y1={from.cy}
                x2={to.cx} y2={to.cy}
                stroke={isHighlighted ? '#ef4444' : '#475569'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? '6,3' : '4,4'}
                opacity={isHighlighted ? 1 : 0.4}
              />
            );
          })}

          {/* Assets */}
          {ASSETS.map((asset) => {
            const isHighlighted = highlightedAsset === asset.id;
            const fillColor = isHighlighted ? '#991b1b' : '#1e293b';
            const strokeColor = isHighlighted ? '#ef4444' : '#475569';

            return (
              <g key={asset.id}>
                {/* Glow effect for highlighted */}
                {isHighlighted && (
                  <>
                    <rect
                      x={asset.x - 4} y={asset.y - 4}
                      width={asset.w + 8} height={asset.h + 8}
                      rx={6} fill="none"
                      stroke="#ef4444" strokeWidth="2"
                      opacity="0.3"
                    >
                      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                    </rect>
                    <rect
                      x={asset.x - 8} y={asset.y - 8}
                      width={asset.w + 16} height={asset.h + 16}
                      rx={8} fill="none"
                      stroke="#ef4444" strokeWidth="1"
                      opacity="0.15"
                    >
                      <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite" />
                    </rect>
                  </>
                )}

                {/* 3D-ish block */}
                <polygon
                  points={`${asset.x + 8},${asset.y} ${asset.x + asset.w + 8},${asset.y} ${asset.x + asset.w},${asset.y + 8} ${asset.x},${asset.y + 8}`}
                  fill={isHighlighted ? '#b91c1c' : '#334155'}
                  stroke={strokeColor} strokeWidth="0.5"
                />
                <polygon
                  points={`${asset.x + asset.w + 8},${asset.y} ${asset.x + asset.w + 8},${asset.y + asset.h} ${asset.x + asset.w},${asset.y + asset.h + 8} ${asset.x + asset.w},${asset.y + 8}`}
                  fill={isHighlighted ? '#7f1d1d' : '#1e293b'}
                  stroke={strokeColor} strokeWidth="0.5"
                />
                <rect
                  x={asset.x} y={asset.y + 8}
                  width={asset.w} height={asset.h}
                  rx={3} fill={fillColor}
                  stroke={strokeColor} strokeWidth={isHighlighted ? 2 : 1}
                />

                {/* Label */}
                <text
                  x={asset.x + asset.w / 2}
                  y={asset.y + asset.h / 2 + 12}
                  textAnchor="middle"
                  fill={isHighlighted ? '#fca5a5' : '#94a3b8'}
                  fontSize="10" fontWeight="bold" fontFamily="monospace"
                >
                  {asset.label}
                </text>
                <text
                  x={asset.x + asset.w / 2}
                  y={asset.y + asset.h / 2 + 24}
                  textAnchor="middle"
                  fill={isHighlighted ? '#fca5a5' : '#64748b'}
                  fontSize="8" fontFamily="monospace"
                >
                  {asset.id}
                </text>

                {/* Warning icon for highlighted */}
                {isHighlighted && (
                  <g>
                    <circle cx={asset.x + asset.w - 2} cy={asset.y + 12} r="10" fill="#ef4444">
                      <animate attributeName="r" values="10;12;10" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <text
                      x={asset.x + asset.w - 2} y={asset.y + 16}
                      textAnchor="middle" fill="white" fontSize="12" fontWeight="bold"
                    >!</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Legend */}
          <text x="40" y="20" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">
            PLANT LAYOUT — ISOMETRIC VIEW
          </text>
          {highlightedAsset && (
            <text x="40" y="35" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">
              RISK ZONE: {taskName || highlightedAsset}
            </text>
          )}
        </svg>
      </div>

      <p className="text-[10px] text-zinc-400 mt-3 text-center font-mono">
        AI identifies the physical asset at risk in the digital twin — not just a spreadsheet row
      </p>
    </div>
  );
};
