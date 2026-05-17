import { createMathFunction } from '../evaluate';
import type { EvaluationOptions } from '../types';
import type { GraphExpressionInput, ParsedGraphExpression } from './graphTypes';

const DECIMAL_NUMBER = '-?\\d+(?:\\.\\d+)?';
const PLAIN_POINT_PATTERN = new RegExp(`^\\(?\\s*(${DECIMAL_NUMBER})\\s*,\\s*(${DECIMAL_NUMBER})\\s*\\)?$`);
const LATEX_POINT_PATTERN = new RegExp(`^\\\\left\\(\\s*(${DECIMAL_NUMBER})\\s*,\\s*(${DECIMAL_NUMBER})\\s*\\\\right\\)$`);

const getEvaluationSource = (expression: GraphExpressionInput): string =>
  (expression.evalText || expression.latex || '').trim();

const getRightHandSide = (source: string): string => source.split('=').slice(1).join('=').trim();

const startsWithAssignmentTo = (source: string, variableName: 'x' | 'y'): boolean => {
  const normalized = source.toLowerCase().replace(/\s+/g, '');
  return normalized.startsWith(`${variableName}=`);
};

const parsePoint = (source: string): { x: number; y: number } | null => {
  const match = source.match(PLAIN_POINT_PATTERN) ?? source.match(LATEX_POINT_PATTERN);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);

  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

export const parseGraphExpression = (
  expression: GraphExpressionInput,
  options: EvaluationOptions = {}
): ParsedGraphExpression => {
  const source = getEvaluationSource(expression);
  if (!source) return { ...expression, type: 'empty' };

  const point = parsePoint(source);
  if (point) {
    return {
      ...expression,
      type: 'point',
      x: point.x,
      y: point.y,
    };
  }

  if (startsWithAssignmentTo(source, 'x')) {
    const afterEquals = getRightHandSide(source);
    const xFunction = createMathFunction(afterEquals, 'y', options);

    return xFunction
      ? { ...expression, type: 'function-y', fn: xFunction }
      : { ...expression, type: 'invalid' };
  }

  const ySource = startsWithAssignmentTo(source, 'y') ? getRightHandSide(source) : source;
  const yFunction = createMathFunction(ySource, 'x', options);

  if (!yFunction) return { ...expression, type: 'invalid' };

  const valueAtOne = yFunction(1);
  const valueAtTwo = yFunction(2);
  const isConstant = !ySource.includes('x') && Number.isFinite(valueAtOne) && valueAtOne === valueAtTwo;

  return isConstant
    ? { ...expression, type: 'constant', numericValue: valueAtOne }
    : { ...expression, type: 'function-x', fn: yFunction };
};

export const parseGraphExpressions = (
  expressions: readonly GraphExpressionInput[],
  options: EvaluationOptions = {}
): ParsedGraphExpression[] => expressions.map((expression) => parseGraphExpression(expression, options));
