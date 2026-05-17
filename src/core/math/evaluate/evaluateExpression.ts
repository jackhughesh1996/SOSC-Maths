import { normalizeForMathJs } from '../normalize';
import { CompiledMathFunction, EvaluationOptions, MathScope, NumericEvaluationResult } from '../types';
import { createEvaluationScope } from './angleModeScope';
import { coerceRealNumber, evaluateMathNode, MathNode, parseMathExpression } from './mathJsAdapter';

export const evaluateSafely = (
  node: MathNode,
  scope: MathScope = {},
  options: EvaluationOptions = {}
): number => {
  try {
    const fullScope = createEvaluationScope(scope, options);
    return coerceRealNumber(evaluateMathNode(node, fullScope));
  } catch {
    return NaN;
  }
};

export const evaluateExpression = (
  expression: string,
  scope: MathScope = {},
  options: EvaluationOptions = {}
): NumericEvaluationResult => {
  const normalizedExpression = normalizeForMathJs(expression);

  try {
    const node = parseMathExpression(normalizedExpression);
    const value = evaluateSafely(node, scope, options);

    return {
      ok: Number.isFinite(value),
      value,
      normalizedExpression,
      error: Number.isFinite(value) ? undefined : 'Expression did not evaluate to a finite real number.',
    };
  } catch (error) {
    return {
      ok: false,
      value: NaN,
      normalizedExpression,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const createMathFunction = (
  expression: string,
  variableName = 'x',
  options: EvaluationOptions = {}
): CompiledMathFunction | null => {
  try {
    const processed = normalizeForMathJs(expression);
    const node = parseMathExpression(processed);
    return (value: number): number => evaluateSafely(node, { [variableName]: value }, options);
  } catch {
    return null;
  }
};

export const calculateResult = (
  expression: string,
  options: EvaluationOptions = {}
): string => {
  if (!expression.trim()) return '';

  const result = evaluateExpression(expression, {}, options);
  return result.ok ? String(result.value) : 'Error';
};
