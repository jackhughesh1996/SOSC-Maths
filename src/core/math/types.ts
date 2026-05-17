export type AngleMode = 'rad' | 'deg';

export interface EvaluationOptions {
  angleMode?: AngleMode;
}

export type MathScopeValue = number | string | boolean;

export type MathScope = Record<string, MathScopeValue>;

export type EvaluationScope = Record<string, unknown>;

export type CompiledMathFunction = (value: number) => number;

export interface NumericEvaluationResult {
  ok: boolean;
  value: number;
  normalizedExpression: string;
  error?: string;
}

export const DEFAULT_ANGLE_MODE: AngleMode = 'rad';
