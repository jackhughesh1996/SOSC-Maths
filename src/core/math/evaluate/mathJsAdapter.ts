import * as mathjs from 'mathjs';

import { EvaluationScope } from '../types';

export type MathNode = mathjs.MathNode;

type ForwardTrigName = 'sin' | 'cos' | 'tan';

const forwardTrigFns: Record<ForwardTrigName, (value: unknown) => unknown> = {
  sin: mathjs.sin as (value: unknown) => unknown,
  cos: mathjs.cos as (value: unknown) => unknown,
  tan: mathjs.tan as (value: unknown) => unknown,
};

export const parseMathExpression = (expression: string): MathNode => mathjs.parse(expression);

export const simplifyMathExpression = (expression: string): string => mathjs.simplify(expression).toString();

export const evaluateMathNode = (node: MathNode, scope: EvaluationScope): unknown => node.evaluate(scope);

export const isMathJsUnit = (value: unknown): boolean => mathjs.isUnit(value);

export const evaluateMathJsForwardTrig = (name: ForwardTrigName, value: unknown): unknown =>
  forwardTrigFns[name](value);

export const coerceRealNumber = (value: unknown): number => {
  if (mathjs.isComplex(value)) return NaN;
  if (mathjs.isUnit(value)) return NaN;
  if (mathjs.isMatrix(value)) return NaN;

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? NaN : numericValue;
};
