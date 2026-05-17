import { useState } from 'react';
import { calculateResult, AngleMode } from '../lib/mathUtils';

export interface HistoryItem {
  expression: string;
  result: string;
  angleMode: AngleMode;
}

export function useCalculator(onEvaluate?: (expression: string, result: string) => void) {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memoryValue, setMemoryValue] = useState<number>(0);
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');

  const input = (value: string) => {
    setExpression((prev) => prev + value);
  };

  const clear = () => {
    setExpression('');
    setResult('');
  };

  const del = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const calculate = () => {
    const formattedResult = calculateResult(expression, { angleMode });
    if (!formattedResult) return;
    
    setResult(formattedResult);
    setHistory((prev) => [...prev, { expression, result: formattedResult, angleMode }]);
    
    if (onEvaluate) {
      onEvaluate(expression, formattedResult);
    }
  };

  const updateAngleMode = (newMode: AngleMode) => {
    setAngleMode(newMode);
    
    // If we have an expression and a result, update the result for the new mode
    if (expression.trim() && result && result !== 'Error') {
      const updatedResult = calculateResult(expression, { angleMode: newMode });
      setResult(updatedResult);
    }
  };

  const memoryClear = () => {
    setMemoryValue(0);
  };

  const memoryRecall = () => {
    const valStr = memoryValue < 0 ? `(${memoryValue})` : memoryValue.toString();
    setExpression((prev) => prev + valStr);
  };

  const memoryAdd = () => {
    const valToEval = expression || result;
    const res = calculateResult(valToEval, { angleMode });
    
    if (res !== 'Error' && res !== '') {
      const numResult = Number(res);
      setMemoryValue((prev) => prev + numResult);
      setResult(numResult.toString());
      setExpression('');
    }
  };

  const memorySubtract = () => {
    const valToEval = expression || result;
    const res = calculateResult(valToEval, { angleMode });
    
    if (res !== 'Error' && res !== '') {
      const numResult = Number(res);
      setMemoryValue((prev) => prev - numResult);
      setResult(numResult.toString());
      setExpression('');
    }
  };

  return {
    expression,
    result,
    history,
    memoryValue,
    angleMode,
    setAngleMode: updateAngleMode,
    input,
    clear,
    delete: del,
    calculate,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
  };
}
