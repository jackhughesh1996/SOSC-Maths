import { MousePointerClick, Plus } from 'lucide-react';

import { AngleModeToggle } from '../../../components/AngleModeToggle';
import { ExpressionList } from '../../../components/ExpressionList';
import { FunctionDrawer } from '../../../components/FunctionDrawer';
import type { MathInputHandle } from '../../../components/MathInput';
import type { AngleMode } from '../../../core/math';
import type { Expression, ParsedExpression } from '../../../types';

interface GraphSidebarProps {
  expressions: Expression[];
  parsedExpressions: ParsedExpression[];
  angleMode: AngleMode;
  pointPlotting: boolean;
  isFullscreen: boolean;
  onAngleModeChange: (mode: AngleMode) => void;
  onPointPlottingChange: (enabled: boolean) => void;
  onAddExpression: () => void;
  onUpdateExpression: (id: string, latex: string, evalText: string) => void;
  onRemoveExpression: (id: string) => void;
  onFocusExpression: (id: string) => void;
  onRegisterInput: (id: string, handle: MathInputHandle | null) => void;
  onInsertFunction: (latex: string) => void;
}

export function GraphSidebar({
  expressions,
  parsedExpressions,
  angleMode,
  pointPlotting,
  isFullscreen,
  onAngleModeChange,
  onPointPlottingChange,
  onAddExpression,
  onUpdateExpression,
  onRemoveExpression,
  onFocusExpression,
  onRegisterInput,
  onInsertFunction,
}: GraphSidebarProps) {
  return (
    <div
      className={[
        'w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-gray-50 flex-shrink-0 relative z-10',
        isFullscreen ? 'md:w-80 shadow-2xl' : 'shadow-[2px_0_12px_-6px_rgba(0,0,0,0.1)]',
      ].join(' ')}
    >
      <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
        <span className="text-sm font-semibold text-gray-700">Expressions</span>
        <div className="flex items-center gap-2">
          <AngleModeToggle value={angleMode} onChange={onAngleModeChange} compact />
          <button
            onClick={() => onPointPlottingChange(!pointPlotting)}
            className={`p-1.5 rounded-md transition-colors ${
              pointPlotting
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            title="Point Plotting Mode"
          >
            <MousePointerClick size={18} />
          </button>
          <button
            onClick={onAddExpression}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Add Expression"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <ExpressionList
        expressions={expressions}
        parsedExpressions={parsedExpressions}
        onUpdate={onUpdateExpression}
        onRemove={onRemoveExpression}
        onFocus={onFocusExpression}
        inputRefs={onRegisterInput}
      />

      <FunctionDrawer onInsert={onInsertFunction} />

      {pointPlotting && (
        <div className="px-3 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-700 flex items-center gap-2">
          <MousePointerClick size={14} />
          Click on the graph to plot points
        </div>
      )}
    </div>
  );
}
