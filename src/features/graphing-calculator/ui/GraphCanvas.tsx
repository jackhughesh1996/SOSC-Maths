import { Mafs, Coordinates, Plot, Point, vec } from 'mafs';

import type { ParsedExpression } from '../../../types';
import { useElementSize } from '../../../hooks/useElementSize';
import { GraphToolbar } from './GraphToolbar';

interface GraphCanvasProps {
  parsedExpressions: ParsedExpression[];
  mafsResetKey: number;
  isFullscreen: boolean;
  fullscreenError: string | null;
  onGraphClick: (point: vec.Vector2) => void;
  onResetView: () => void;
  onToggleFullscreen: () => void;
}

export function GraphCanvas({
  parsedExpressions,
  mafsResetKey,
  isFullscreen,
  fullscreenError,
  onGraphClick,
  onResetView,
  onToggleFullscreen,
}: GraphCanvasProps) {
  const { setRef: setGraphRef, size: graphSize } = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={setGraphRef}
      className="flex-1 relative min-h-[300px] cursor-crosshair bg-white mafs-light-theme"
      style={{ colorScheme: 'light' }}
    >
      <GraphToolbar
        isFullscreen={isFullscreen}
        onResetView={onResetView}
        onToggleFullscreen={onToggleFullscreen}
      />

      {fullscreenError && (
        <div className="absolute bottom-4 right-4 z-20 max-w-xs rounded-xl border border-red-200 bg-white/80 px-3 py-2 text-xs text-red-700 shadow-lg backdrop-blur-md">
          {fullscreenError}
        </div>
      )}

      {/* Known debt: Mafs does not expose a public onViewBoxChange/onCameraChange callback.
          We remount Mafs only for explicit Reset View while preserving native pan/zoom quality. */}
      <Mafs
        key={mafsResetKey}
        pan
        zoom
        onClick={onGraphClick}
        height={graphSize.height || 500}
        width="auto"
      >
        <Coordinates.Cartesian />
        {parsedExpressions.map((expression) => {
          if (expression.type === 'function-x') {
            return <Plot.OfX key={expression.id} y={expression.fn} color={expression.color} />;
          }

          if (expression.type === 'function-y') {
            return <Plot.OfY key={expression.id} x={expression.fn} color={expression.color} />;
          }

          if (expression.type === 'point') {
            return <Point key={expression.id} x={expression.x} y={expression.y} color={expression.color} />;
          }

          return null;
        })}
      </Mafs>
    </div>
  );
}
