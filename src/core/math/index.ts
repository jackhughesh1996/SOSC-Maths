export type {
  AngleMode,
  CompiledMathFunction,
  EvaluationOptions,
  EvaluationScope,
  MathScope,
  MathScopeValue,
  NumericEvaluationResult,
} from './types';
export { DEFAULT_ANGLE_MODE } from './types';

export {
  normalizeForMathJs,
  processForMathJs,
  traceNormalizationForMathJs,
} from './normalize';
export type { NormalizationStep, NormalizationStepName, NormalizationTrace, NormalizationTraceItem } from './normalize';

export {
  calculateResult,
  createEvaluationScope,
  createMathFunction,
  evaluateExpression,
  evaluateSafely,
  parseMathExpression,
  simplifyMathExpression,
} from './evaluate';
export type { MathNode } from './evaluate';

export { parseGraphExpression, parseGraphExpressions } from './graph';
export type { GraphExpressionInput, ParsedGraphExpression } from './graph';


