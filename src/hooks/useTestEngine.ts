import { useState, useCallback } from 'react';
import { Test } from '../types/test';

export interface CalculatorLog {
  questionId: string;
  expression: string;
  result: string;
  timestamp: number;
}

export function useTestEngine(test: Test | null) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [calculatorLogs, setCalculatorLogs] = useState<CalculatorLog[]>([]);

  const currentQuestion = test?.questions[currentQuestionIndex];

  const goToNext = useCallback(() => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [test, currentQuestionIndex]);

  const goToPrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const submitAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const logCalculatorUsage = useCallback((questionId: string, expression: string, result: string) => {
    setCalculatorLogs((prev) => [
      ...prev,
      { questionId, expression, result, timestamp: Date.now() }
    ]);
  }, []);

  const finishTest = useCallback(() => {
    console.log("Test finished!");
    
    // Grading logic
    const gradingResults: Record<string, { correct: boolean, expected?: any, actual?: string, message?: string }> = {};
    let score = 0;
    
    if (test) {
      test.questions.forEach(q => {
        const userAnswer = answers[q.id];
        
        if (q.type === 'graph_points' && q.expectedPoints) {
          try {
            const plottedPoints: {x: number, y: number}[] = userAnswer ? JSON.parse(userAnswer) : [];
            
            // Basic set equality check (ignoring order)
            if (plottedPoints.length === q.expectedPoints.length) {
              const allCorrect = q.expectedPoints.every(expected => 
                plottedPoints.some(plotted => Math.abs(plotted.x - expected.x) < 0.1 && Math.abs(plotted.y - expected.y) < 0.1)
              );
              
              if (allCorrect) {
                 gradingResults[q.id] = { correct: true };
                 score++;
              } else {
                 gradingResults[q.id] = { correct: false, expected: q.expectedPoints, actual: userAnswer, message: 'Points do not match expected.' };
              }
            } else {
              gradingResults[q.id] = { correct: false, expected: q.expectedPoints, actual: userAnswer, message: 'Incorrect number of points.' };
            }
          } catch {
            gradingResults[q.id] = { correct: false, expected: q.expectedPoints, actual: userAnswer, message: 'Invalid point data.' };
          }
        } else {
          // Normal text matching (not implemented in this simplified demo)
          gradingResults[q.id] = { correct: false, message: 'Auto-grading for text not implemented.' };
        }
      });
    }

    console.log("Final Answers:", answers);
    console.log("Grading Results:", gradingResults);
    console.log("Score:", score);
    console.log("Calculator Logs:", calculatorLogs);
    
    // In a full implementation, you would trigger an API call here.
    return {
      answers,
      calculatorLogs,
      gradingResults,
      score
    };
  }, [answers, calculatorLogs, test]);

  const jumpToQuestion = useCallback((index: number) => {
    if (test && index >= 0 && index < test.questions.length) {
      setCurrentQuestionIndex(index);
    }
  }, [test]);

  return {
    currentQuestionIndex,
    currentQuestion,
    answers,
    calculatorLogs,
    isFirstQuestion: currentQuestionIndex === 0,
    isLastQuestion: test ? currentQuestionIndex === test.questions.length - 1 : true,
    goToNext,
    goToPrev,
    jumpToQuestion,
    submitAnswer,
    logCalculatorUsage,
    finishTest,
  };
}
