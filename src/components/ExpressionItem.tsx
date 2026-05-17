import React from 'react';
import { X, FunctionSquare, Navigation } from 'lucide-react';
import { MathInput, MathInputHandle } from './MathInput';
import { Expression, ParsedExpression } from '../types';

interface ExpressionItemProps {
  expression: Expression;
  parsed: ParsedExpression;
  onUpdate: (id: string, latex: string, evalText: string) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  inputRef?: (id: string, handle: MathInputHandle | null) => void;
}

export function ExpressionItem({ expression, parsed, onUpdate, onRemove, onFocus, inputRef }: ExpressionItemProps) {
  const isInvalid = parsed.type === 'invalid';

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-md shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
      <div className="flex items-center">
        <div 
          className="w-10 h-full min-h-[40px] flex border-r border-gray-100 justify-center items-center flex-shrink-0"
          style={{ color: expression.color, backgroundColor: `${expression.color}10` }}
        >
          {parsed.type === 'point' ? (
             <Navigation size={14} className="opacity-80" />
          ) : (
            <FunctionSquare size={14} className="opacity-80" />
          )}
        </div>
        <div className="flex-1 px-2 py-1 flex items-center min-w-0">
          <MathInput
            ref={(handle) => inputRef?.(expression.id, handle)}
            value={expression.latex}
            onChange={(latex, ascii) => onUpdate(expression.id, latex, ascii)}
            onFocus={() => onFocus(expression.id)}
            placeholder="e.g. sin(x)"
            className={`flex-1 ${isInvalid && expression.latex ? 'text-red-500' : 'text-gray-800'}`}
          />
          {parsed.type === 'constant' && !isNaN(parsed.numericValue) && (
            <div className="text-xs font-mono text-gray-400 ml-2 whitespace-nowrap bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
              = {Number.isInteger(parsed.numericValue) ? parsed.numericValue : parsed.numericValue.toFixed(4).replace(/\.?0+$/, '')}
            </div>
          )}
        </div>
        <button 
          onClick={() => onRemove(expression.id)}
          className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0 h-full aspect-square flex items-center justify-center border-l border-transparent group-hover:border-gray-100"
          aria-label="Remove"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
