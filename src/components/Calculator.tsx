import React, { useEffect, useRef } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { AngleModeToggle } from './AngleModeToggle';

export interface CalculatorProps {
  allowAdvanced?: boolean;
  allowHistory?: boolean;
  onEvaluate?: (expression: string, result: string) => void;
}

export function Calculator({
  allowAdvanced = true,
  allowHistory = true,
  onEvaluate
}: CalculatorProps = {}) {
  const { 
    expression, result, history, memoryValue, angleMode, setAngleMode,
    input, clear, delete: del, calculate,
    memoryClear, memoryRecall, memoryAdd, memorySubtract
  } = useCalculator(onEvaluate);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleBtnClick = (btn: string) => {
    if (btn === 'AC') clear();
    else if (btn === 'DEL') del();
    else if (btn === '=') calculate();
    else if (['sin', 'cos', 'tan', 'ln', 'sqrt'].includes(btn)) input(`${btn}(`);
    else if (btn === 'π') input('π');
    else input(btn);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;

    if (e.altKey) {
      if (key.toLowerCase() === 'c') {
        e.preventDefault();
        memoryClear();
      } else if (key.toLowerCase() === 'r') {
        e.preventDefault();
        memoryRecall();
      } else if (key === '+' || key === '=') {
        e.preventDefault();
        memoryAdd();
      } else if (key === '-') {
        e.preventDefault();
        memorySubtract();
      } else if (key.toLowerCase() === 'p') {
        e.preventDefault();
        input('π');
      } else if (key.toLowerCase() === 'e') {
        e.preventDefault();
        input('e');
      }
      return;
    }

    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/'].includes(key)) {
      e.preventDefault();
      input(key);
    } else if (allowAdvanced && ['(', ')', '^'].includes(key)) {
      e.preventDefault();
      input(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
    } else if (key === 'Backspace') {
      e.preventDefault();
      del();
    } else if (key === 'Escape') {
      e.preventDefault();
      clear();
    } else if (allowAdvanced && key === 's') {
      e.preventDefault();
      input('sin(');
    } else if (allowAdvanced && key === 'c') {
      e.preventDefault();
      input('cos(');
    } else if (allowAdvanced && key === 't') {
      e.preventDefault();
      input('tan(');
    } else if (allowAdvanced && key === 'l') {
      e.preventDefault();
      input('ln(');
    } else if (allowAdvanced && key === 'r') {
      e.preventDefault();
      input('sqrt(');
    } else if (allowAdvanced && key === 'p') {
      e.preventDefault();
      input('π');
    } else if (allowAdvanced && key === 'e') {
      e.preventDefault();
      input('e');
    }
  };

  const btnBaseClass = "p-3 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
  const numBtnClass = `${btnBaseClass} bg-gray-100 text-gray-800 hover:bg-gray-200`;
  const opBtnClass = `${btnBaseClass} bg-blue-50 text-blue-600 hover:bg-blue-100`;
  const cmdBtnClass = `${btnBaseClass} bg-red-50 text-red-600 hover:bg-red-100`;
  const eqBtnClass = `${btnBaseClass} bg-blue-600 text-white hover:bg-blue-700 shadow-sm`;

  const renderBtn = (label: string, className: string = numBtnClass) => (
    <button key={label} onClick={() => handleBtnClick(label)} className={className}>
      {label}
    </button>
  );

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full h-full flex flex-col bg-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {/* Display */}
      <div className="p-5 bg-gray-50 flex flex-col justify-end text-right min-h-[100px] border-b border-gray-100">
        <div className="flex justify-between items-center text-gray-500 text-sm mb-1">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-700 text-lg leading-none">{memoryValue !== 0 ? 'M' : '\u00A0'}</div>
            {allowAdvanced && (
              <AngleModeToggle value={angleMode} onChange={setAngleMode} compact />
            )}
          </div>
          <div className="truncate ml-2">{expression || '\u00A0'}</div>
        </div>
        <div className="text-3xl font-semibold text-gray-900 truncate tracking-tight">
          {result || (expression ? '\u00A0' : '0')}
        </div>
      </div>

      {/* Memory Row */}
      <div className="px-4 pt-4 pb-1 grid grid-cols-4 gap-2">
        <button onClick={memoryClear} title="Memory Clear (Alt+C)" className="py-1.5 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">MC</button>
        <button onClick={memoryRecall} title="Memory Recall (Alt+R)" className="py-1.5 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">MR</button>
        <button onClick={memoryAdd} title="Memory Add (Alt++)" className="py-1.5 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">M+</button>
        <button onClick={memorySubtract} title="Memory Subtract (Alt+-)" className="py-1.5 text-xs font-semibold rounded bg-gray-100 hover:bg-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">M-</button>
      </div>
      
      {/* Keypad */}
      <div className={`flex-1 p-4 pt-2 grid ${allowAdvanced ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
        {allowAdvanced && (
          <>
            {renderBtn('AC', cmdBtnClass)}
            {renderBtn('DEL', cmdBtnClass)}
            {renderBtn('(', opBtnClass)}
            {renderBtn(')', opBtnClass)}
            
            {renderBtn('sin', opBtnClass)}
            {renderBtn('cos', opBtnClass)}
            {renderBtn('tan', opBtnClass)}
            {renderBtn('ln', opBtnClass)}
            
            {renderBtn('^', opBtnClass)}
            {renderBtn('sqrt', opBtnClass)}
            {renderBtn('π', opBtnClass)}
            {renderBtn('e', opBtnClass)}
          </>
        )}
        
        {!allowAdvanced && (
          <>
            {renderBtn('AC', cmdBtnClass)}
            {renderBtn('DEL', cmdBtnClass)}
            {renderBtn('/', opBtnClass)}
          </>
        )}

        {allowAdvanced && renderBtn('7')}
        {allowAdvanced && renderBtn('8')}
        {allowAdvanced && renderBtn('9')}
        {allowAdvanced && renderBtn('/', opBtnClass)}

        {!allowAdvanced && renderBtn('7')}
        {!allowAdvanced && renderBtn('8')}
        {!allowAdvanced && renderBtn('9')}

        {allowAdvanced && renderBtn('4')}
        {allowAdvanced && renderBtn('5')}
        {allowAdvanced && renderBtn('6')}
        {allowAdvanced && renderBtn('*', opBtnClass)}
        
        {!allowAdvanced && renderBtn('4')}
        {!allowAdvanced && renderBtn('5')}
        {!allowAdvanced && renderBtn('6')}
        
        {allowAdvanced && renderBtn('1')}
        {allowAdvanced && renderBtn('2')}
        {allowAdvanced && renderBtn('3')}
        {allowAdvanced && renderBtn('-', opBtnClass)}

        {!allowAdvanced && renderBtn('1')}
        {!allowAdvanced && renderBtn('2')}
        {!allowAdvanced && renderBtn('3')}

        {allowAdvanced && renderBtn('0')}
        {allowAdvanced && renderBtn('.')}
        {allowAdvanced && renderBtn('=', eqBtnClass)}
        {allowAdvanced && renderBtn('+', opBtnClass)}

        {!allowAdvanced && renderBtn('*', opBtnClass)}
        {!allowAdvanced && renderBtn('0')}
        {!allowAdvanced && renderBtn('.')}

        {!allowAdvanced && renderBtn('-', opBtnClass)}
        {!allowAdvanced && renderBtn('+', opBtnClass)}
        {!allowAdvanced && renderBtn('=', eqBtnClass)}
      </div>

      {allowHistory && history.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 max-h-32 overflow-y-auto">
          <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">History</div>
          <div className="space-y-2">
            {history.slice().reverse().map((item, idx) => (
              <div key={idx} className="text-right text-sm">
                <div className="text-gray-500">{item.expression}</div>
                <div className="text-gray-900 font-medium">={item.result}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
