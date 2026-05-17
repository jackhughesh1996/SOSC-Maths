import React from 'react';
import { ExpressionItem } from './ExpressionItem';
import { Expression, ParsedExpression } from '../types';
import { MathInputHandle } from './MathInput';

interface ExpressionListProps {
  expressions: Expression[];
  parsedExpressions: ParsedExpression[];
  onUpdate: (id: string, latex: string, evalText: string) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  inputRefs?: (id: string, handle: MathInputHandle | null) => void;
}

export function ExpressionList({ 
  expressions, 
  parsedExpressions, 
  onUpdate, 
  onRemove,
  onFocus,
  inputRefs
}: ExpressionListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {expressions.map((exp, index) => (
        <ExpressionItem
          key={exp.id}
          expression={exp}
          parsed={parsedExpressions[index]}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onFocus={onFocus}
          inputRef={inputRefs}
        />
      ))}
    </div>
  );
}
