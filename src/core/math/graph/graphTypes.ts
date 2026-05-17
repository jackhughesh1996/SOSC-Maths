import type { CompiledMathFunction } from '../types';

export interface GraphExpressionInput {
  id: string;
  latex: string;
  evalText: string;
  color: string;
}

export type ParsedGraphExpression =
  | (GraphExpressionInput & { type: 'empty' })
  | (GraphExpressionInput & { type: 'point'; x: number; y: number })
  | (GraphExpressionInput & { type: 'function-x'; fn: CompiledMathFunction })
  | (GraphExpressionInput & { type: 'function-y'; fn: CompiledMathFunction })
  | (GraphExpressionInput & { type: 'constant'; numericValue: number })
  | (GraphExpressionInput & { type: 'invalid' });
