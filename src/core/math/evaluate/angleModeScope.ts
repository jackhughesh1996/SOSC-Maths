import { DEFAULT_ANGLE_MODE, EvaluationOptions, EvaluationScope, MathScope } from '../types';
import { evaluateMathJsForwardTrig, isMathJsUnit } from './mathJsAdapter';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

const toFiniteNumber = (value: unknown): number | null => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const reciprocal = (value: unknown): number => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? 1 / numericValue : NaN;
};

export const createEvaluationScope = (
  scope: MathScope = {},
  options: EvaluationOptions = {}
): EvaluationScope => {
  const angleMode = options.angleMode ?? DEFAULT_ANGLE_MODE;

  const toRadians = (value: number): number => (angleMode === 'deg' ? value * DEG_TO_RAD : value);
  const fromRadians = (value: number): number => (angleMode === 'deg' ? value * RAD_TO_DEG : value);

  const forward = (fn: (x: number) => number, mathJsName: 'sin' | 'cos' | 'tan') => (value: unknown): unknown => {
    if (isMathJsUnit(value)) {
      return evaluateMathJsForwardTrig(mathJsName, value);
    }

    const numericValue = toFiniteNumber(value);
    return numericValue === null ? NaN : fn(toRadians(numericValue));
  };

  const inverse = (fn: (...args: number[]) => number) => (...args: unknown[]): number => {
    const numericArgs = args.map(toFiniteNumber);
    if (numericArgs.some((value): value is null => value === null)) return NaN;

    const result = fn(...(numericArgs as number[]));
    return Number.isFinite(result) ? fromRadians(result) : result;
  };

  const sin = forward(Math.sin, 'sin');
  const cos = forward(Math.cos, 'cos');
  const tan = forward(Math.tan, 'tan');

  const asin = inverse(Math.asin);
  const acos = inverse(Math.acos);
  const atan = inverse(Math.atan);
  const atan2 = inverse(Math.atan2);

  return {
    ...scope,
    e: Math.E,
    pi: Math.PI,
    sin,
    cos,
    tan,
    sec: (value: unknown): number => reciprocal(cos(value)),
    csc: (value: unknown): number => reciprocal(sin(value)),
    cot: (value: unknown): number => reciprocal(tan(value)),
    asin,
    acos,
    atan,
    atan2,
    arcsin: asin,
    arccos: acos,
    arctan: atan,
  };
};
