import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface GraphToolbarProps {
  isFullscreen: boolean;
  onResetView: () => void;
  onToggleFullscreen: () => void;
}

export function GraphToolbar({ isFullscreen, onResetView, onToggleFullscreen }: GraphToolbarProps) {
  return (
    <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/70 p-2 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={onResetView}
        className="rounded-xl p-2 text-gray-700 transition hover:bg-white/80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw size={18} />
      </button>

      <div className="my-1 h-px bg-gray-200/80" />

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="rounded-xl p-2 text-gray-700 transition hover:bg-white/80 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}
