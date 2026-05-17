/**
 * @anchor AGENTS.md
 * This file adheres to the SOSC Maths Memory Bank architectural rules.
 * Update the 'Refactoring History' or 'Known Debt' in AGENTS.md upon modification.
 */
export type {
  AngleMode,
  CompiledMathFunction,
  EvaluationOptions,
  EvaluationScope,
  MathNode,
  MathScope,
  MathScopeValue,
  NumericEvaluationResult,
  NormalizationStep,
  NormalizationStepName,
  NormalizationTrace,
  NormalizationTraceItem,
} from '../core/math';

export {
  calculateResult,
  createEvaluationScope,
  createMathFunction,
  DEFAULT_ANGLE_MODE,
  evaluateExpression,
  evaluateSafely,
  normalizeForMathJs,
  parseMathExpression,
  processForMathJs,
  simplifyMathExpression,
  traceNormalizationForMathJs,
} from '../core/math';
