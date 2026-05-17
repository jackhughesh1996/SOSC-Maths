import React, { useState, useCallback, useEffect } from 'react';
import { Mafs, Coordinates, Point, vec } from "mafs";
import { MousePointerClick, X } from 'lucide-react';
import "mafs/core.css";
import "mafs/font.css";
import { PointType } from '../types/test';

interface InlineGraphPointsInputProps {
  value: string; // JSON string of PointType[]
  onChange: (value: string) => void;
}

export function InlineGraphPointsInput({ value, onChange }: InlineGraphPointsInputProps) {
  const [points, setPoints] = useState<PointType[]>(() => {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });

  // Sync internal points if external value changes (like when jumping questions)
  useEffect(() => {
    try {
      setPoints(value ? JSON.parse(value) : []);
    } catch {
      setPoints([]);
    }
  }, [value]);

  const handleGraphClick = useCallback((pt: vec.Vector2) => {
    const px = Math.round(pt[0] * 10) / 10;
    const py = Math.round(pt[1] * 10) / 10;
    
    // Check if clicking near an existing point to remove it
    const existingIndex = points.findIndex(p => Math.abs(p.x - px) < 0.5 && Math.abs(p.y - py) < 0.5);
    
    let newPoints;
    if (existingIndex >= 0) {
      newPoints = points.filter((_, i) => i !== existingIndex);
    } else {
      newPoints = [...points, { x: px, y: py }];
    }
    
    setPoints(newPoints);
    onChange(JSON.stringify(newPoints));
  }, [points, onChange]);

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    onChange(JSON.stringify(newPoints));
  };

  return (
    <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-700">
        <MousePointerClick size={16} />
        Click on the graph to plot points. Click near a point to remove it.
      </div>
      
      <div className="flex flex-col md:flex-row h-[400px]">
        {/* Graph Area */}
        <div className="flex-1 relative cursor-crosshair h-full bg-white mafs-light-theme" style={{ colorScheme: 'light' }}>
          <Mafs pan={true} zoom={true} onClick={handleGraphClick}>
            <Coordinates.Cartesian />
            {points.map((p, i) => (
              <Point key={i} x={p.x} y={p.y} color="#ef4444" />
            ))}
          </Mafs>
        </div>

        {/* Selected Points Sidebar */}
        <div className="w-full md:w-48 bg-gray-50 border-l border-gray-200 flex flex-col items-stretch max-h-[150px] md:max-h-full">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-100">
            Plotted Points
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {points.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4 italic">No points plotted</div>
            ) : (
              points.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 text-sm shadow-sm group">
                  <span className="font-mono">({p.x}, {p.y})</span>
                  <button 
                    onClick={() => removePoint(i)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove point"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
