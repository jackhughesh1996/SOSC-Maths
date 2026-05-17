import { useCallback, useMemo, useState } from 'react';
import { Theme, vec } from 'mafs';

import { AngleMode, parseGraphExpressions } from '../../../core/math';
import type { MathInputHandle } from '../../../components/MathInput';
import type { Expression, ParsedExpression } from '../../../types';
import { useMathInputRegistry } from './useMathInputRegistry';

const COLORS = [Theme.blue, Theme.red, Theme.green, Theme.yellow, Theme.indigo, Theme.pink];

const createExpressionId = (): string => Math.random().toString(36).substring(7);

const getColorForIndex = (index: number): string => COLORS[index % COLORS.length];

const createExpression = (index: number, latex = '', evalText = latex): Expression => ({
  id: createExpressionId(),
  latex,
  evalText,
  color: getColorForIndex(index),
});

export interface GraphingCalculatorController {
  expressions: Expression[];
  parsedExpressions: ParsedExpression[];
  angleMode: AngleMode;
  pointPlotting: boolean;
  setAngleMode: (mode: AngleMode) => void;
  setFocusedId: (id: string | null) => void;
  setPointPlotting: (value: boolean) => void;
  addExpression: () => void;
  updateExpression: (id: string, latex: string, evalText: string) => void;
  removeExpression: (id: string) => void;
  handleInsert: (latex: string) => void;
  handleGraphClick: (point: vec.Vector2) => void;
  registerInput: (id: string, handle: MathInputHandle | null) => void;
}

export const useGraphingCalculator = (): GraphingCalculatorController => {
  const [expressions, setExpressions] = useState<Expression[]>([
    { id: '1', latex: '\\ln(x)', evalText: 'ln(x)', color: Theme.blue },
    { id: '2', latex: '(1, 2)', evalText: '(1, 2)', color: Theme.red },
  ]);
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');
  const [pointPlotting, setPointPlotting] = useState(false);

  const {
    focusedId,
    setFocusedId,
    registerInput,
    focusInput,
    insertIntoInput,
    unregisterInput,
  } = useMathInputRegistry();

  const parsedExpressions = useMemo(
    () => parseGraphExpressions(expressions, { angleMode }),
    [angleMode, expressions]
  );

  const addExpression = useCallback(() => {
    let nextId = '';

    setExpressions((currentExpressions) => {
      const nextExpression = createExpression(currentExpressions.length);
      nextId = nextExpression.id;
      return [...currentExpressions, nextExpression];
    });

    window.setTimeout(() => focusInput(nextId), 50);
  }, [focusInput]);

  const updateExpression = useCallback((id: string, latex: string, evalText: string) => {
    setExpressions((currentExpressions) =>
      currentExpressions.map((expression) =>
        expression.id === id ? { ...expression, latex, evalText } : expression
      )
    );
  }, []);

  const removeExpression = useCallback(
    (id: string) => {
      setExpressions((currentExpressions) => currentExpressions.filter((expression) => expression.id !== id));
      unregisterInput(id);
    },
    [unregisterInput]
  );

  const handleInsert = useCallback(
    (latex: string) => {
      const fallbackTargetId = expressions.at(-1)?.id ?? null;
      const targetId = focusedId ?? fallbackTargetId;

      if (targetId && insertIntoInput(targetId, latex)) return;

      let nextId = '';
      setExpressions((currentExpressions) => {
        const nextExpression = createExpression(currentExpressions.length);
        nextId = nextExpression.id;
        return [...currentExpressions, nextExpression];
      });

      window.setTimeout(() => {
        insertIntoInput(nextId, latex);
      }, 50);
    },
    [expressions, focusedId, insertIntoInput]
  );

  const handleGraphClick = useCallback(
    (point: vec.Vector2) => {
      if (!pointPlotting) return;

      const px = Math.round(point[0] * 100) / 100;
      const py = Math.round(point[1] * 100) / 100;
      const value = `(${px}, ${py})`;

      setExpressions((currentExpressions) => [
        ...currentExpressions,
        createExpression(currentExpressions.length, value, value),
      ]);
    },
    [pointPlotting]
  );

  return {
    expressions,
    parsedExpressions,
    angleMode,
    pointPlotting,
    setAngleMode,
    setFocusedId,
    setPointPlotting,
    addExpression,
    updateExpression,
    removeExpression,
    handleInsert,
    handleGraphClick,
    registerInput,
  };
};
