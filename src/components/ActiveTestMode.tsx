import React, { useState, useEffect, useRef } from 'react';
import { Test } from '../types/test';
import { useTestEngine } from '../hooks/useTestEngine';
import { Clock, Calculator as CalculatorIcon, CheckCircle, LineChart } from 'lucide-react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { FloatingCalculator } from './FloatingCalculator';
import { FloatingGraph } from './FloatingGraph';
import { InlineGraphPointsInput } from './InlineGraphPointsInput';

interface ActiveTestModeProps {
  test: Test;
  onExit: (mode?: 'practice' | 'test_selection') => void;
}

export function ActiveTestMode({ test, onExit }: ActiveTestModeProps) {
  const {
    currentQuestionIndex,
    currentQuestion,
    answers,
    submitAnswer,
    goToNext,
    goToPrev,
    jumpToQuestion,
    isFirstQuestion,
    isLastQuestion,
    finishTest,
    logCalculatorUsage
  } = useTestEngine(test);

  const mfRef = useRef<MathfieldElement>(null);
  const [value, setValue] = useState(answers[currentQuestion?.id || ''] || '');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [isReviewScreen, setIsReviewScreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (currentQuestion) {
      setValue(answers[currentQuestion.id] || '');
      if (!currentQuestion.calculatorConfig.allowed) {
        setIsCalculatorOpen(false);
        setIsGraphOpen(false);
      }
    }
  }, [currentQuestion?.id, answers, currentQuestion?.calculatorConfig.allowed]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    
    mf.value = value;
    
    const handleInput = (e: Event) => {
      const target = e.target as MathfieldElement;
      setValue(target.value);
      if (currentQuestion) {
        submitAnswer(currentQuestion.id, target.value);
      }
    };
    
    mf.addEventListener('input', handleInput);
    
    return () => {
      mf.removeEventListener('input', handleInput);
    };
  }, [currentQuestion?.id, submitAnswer]);

  const handleSubmitTest = () => {
    const results = finishTest();
    setIsSubmitted(results as any);
  };

  if (isSubmitted) {
    const results = isSubmitted as any;
    return (
      <div className="flex flex-col bg-[#f5f5f5] min-h-screen p-6 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-2xl w-full mx-auto">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">Test Submitted Successfully!</h2>
          <p className="text-gray-500 text-center mb-8">Great job! Your answers have been recorded.</p>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Grading Report (Auto-gradable questions)</h3>
            <div className="space-y-4 text-sm text-gray-700">
              {test.questions.filter(q => q.type === 'graph_points').map(q => {
                const res = results.gradingResults[q.id];
                return (
                  <div key={q.id} className="flex flex-col gap-1 p-3 bg-white border border-gray-200 rounded-md">
                    <div className="font-medium">Question: <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.text}</Markdown></div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-gray-500">Result: </span>
                       {res?.correct ? (
                         <span className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">Correct</span>
                       ) : (
                         <span className="text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded">Incorrect</span>
                       )}
                    </div>
                    {!res?.correct && res?.message && (
                      <div className="text-gray-500 italic mt-1">{res.message}</div>
                    )}
                  </div>
                );
              })}
              {test.questions.filter(q => q.type === 'graph_points').length === 0 && (
                <div className="text-gray-500 italic">No auto-gradable questions in this test.</div>
              )}
            </div>
            {test.questions.filter(q => q.type === 'graph_points').length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 font-semibold">
                Auto-graded Score: <span className="text-blue-600">{results.score}</span> / {test.questions.filter(q => q.type === 'graph_points').length}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onExit('practice')}
            className="w-full px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
          >
            Return to Practice
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="flex flex-col bg-[#f5f5f5] min-h-screen">
      {/* Test Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">{test.title}</h2>
            <span className="text-sm text-gray-500 font-medium mt-1">
              {isReviewScreen ? 'Reviewing Answers' : `Question ${currentQuestionIndex + 1} of ${test.questions.length}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {currentQuestion?.calculatorConfig.allowed && !isReviewScreen && (
              <>
                <button 
                  onClick={() => setIsCalculatorOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors shadow-sm ${
                    isCalculatorOpen 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <CalculatorIcon size={16} />
                  Calculator
                </button>
                <button 
                  onClick={() => setIsGraphOpen((prev) => !prev)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors shadow-sm ${
                    isGraphOpen 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <LineChart size={16} />
                  Graphing
                </button>
              </>
            )}
            
            {/* Optional Timer */}
            <div className="flex items-center gap-2 ml-2 text-gray-600 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <Clock size={16} className="text-gray-400" />
              <span className="font-medium">45:00</span>
            </div>
            
            <button 
              onClick={() => onExit()}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent"
            >
              Exit Test
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex justify-center p-6 mx-auto w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full h-fit">
          {isReviewScreen ? (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Review Your Answers</h2>
                <p className="text-gray-500 mt-1 pb-4 border-b border-gray-100">
                  Please review your questions before submitting the test.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {test.questions.map((q, idx) => {
                  const answered = !!answers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setIsReviewScreen(false);
                        jumpToQuestion(idx);
                      }}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="font-medium text-gray-800">Question {idx + 1}</span>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${answered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {answered ? 'Answered' : 'Unanswered'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="flex flex-col gap-8">
              {/* Optional Diagram */}
              {currentQuestion.diagram && (
                <div className="flex justify-center mb-6">
                  <img 
                    src={currentQuestion.diagram.url} 
                    alt={currentQuestion.diagram.alt} 
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
              )}

              {/* Question Text */}
              <div className="prose max-w-none text-gray-800 text-lg">
                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentQuestion.text}
                </Markdown>
              </div>

              {/* Answer Input */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Your Answer</h3>
                {currentQuestion.type === 'graph_points' ? (
                  <InlineGraphPointsInput 
                    value={value} 
                    onChange={(newValue) => {
                      setValue(newValue);
                      submitAnswer(currentQuestion.id, newValue);
                    }} 
                  />
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-shadow focus-within:shadow-md focus-within:border-blue-300">
                    <math-field 
                      ref={mfRef} 
                      class="w-full"
                      style={{
                        fontSize: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">
              Question not found.
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0 z-20 mt-auto">
        <div className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
          {isReviewScreen ? (
            <>
              <button
                onClick={() => setIsReviewScreen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors"
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmitTest}
                className="px-6 py-2.5 rounded-xl font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
              >
                Submit Final Answers
              </button>
            </>
          ) : (
            <>
              <button
                onClick={goToPrev}
                disabled={isFirstQuestion}
                className={`px-6 py-2.5 rounded-xl font-medium transition-colors border ${
                  isFirstQuestion
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
              >
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={() => setIsReviewScreen(true)}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Review & Submit
                </button>
              ) : (
                <button
                  onClick={goToNext}
                  className="px-6 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 shadow-sm transition-colors"
                >
                  Next
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isCalculatorOpen && currentQuestion?.calculatorConfig.allowed && !isReviewScreen && (
        <FloatingCalculator 
          isOpen={isCalculatorOpen} 
          onClose={() => setIsCalculatorOpen(false)} 
          allowAdvanced={currentQuestion.calculatorConfig.allowAdvanced}
          allowHistory={false}
          onEvaluate={(expr, res) => currentQuestion && logCalculatorUsage(currentQuestion.id, expr, res)}
        />
      )}
      
      {isGraphOpen && currentQuestion?.calculatorConfig.allowed && !isReviewScreen && (
        <FloatingGraph 
          isOpen={isGraphOpen} 
          onClose={() => setIsGraphOpen(false)} 
        />
      )}
    </div>
  );
}
