import React, { useState, useEffect, useRef } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import { Calculator as CalculatorIcon, GraduationCap, LineChart } from 'lucide-react';

interface PracticeModeProps {
  onToggleCalc: () => void;
  onToggleGraph: () => void;
  onStartTest: () => void;
}

export function PracticeMode({ onToggleCalc, onToggleGraph, onStartTest }: PracticeModeProps) {
  const mfRef = useRef<MathfieldElement>(null);
  const [value, setValue] = useState('\\frac{1}{2}x^2 + y = 10');

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    
    // Set initial value explicitly as React doesn't always sync web component properties easily
    mf.value = value;
    
    const handleInput = (e: Event) => {
      const target = e.target as MathfieldElement;
      setValue(target.value);
    };
    
    mf.addEventListener('input', handleInput);
    
    return () => {
      mf.removeEventListener('input', handleInput);
    };
  }, []);

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 w-full max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-light mb-2">Math Editor</h1>
          <p className="text-[#9e9e9e] text-sm">
            Type your math equations interactively.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onToggleCalc}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <CalculatorIcon size={16} />
            Calculator
          </button>
          <button 
            onClick={onToggleGraph}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <LineChart size={16} />
            Graphing
          </button>
        </div>
      </div>
      
      <div>
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
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h2 className="text-xs uppercase tracking-[0.5px] font-medium text-[#9e9e9e] mb-3">LaTeX Source</h2>
        <div className="bg-[#f8f9fa] text-gray-700 p-4 rounded-xl font-mono text-sm overflow-x-auto border border-gray-100">
          {value || '\\text{Empty}'}
        </div>
      </div>

      <div className="mt-4 pt-8 border-t border-gray-100 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
          <GraduationCap size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to test your skills?</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-md">
          Switch to Test Mode to answer math problems securely. The calculator will be configured with test-specific settings.
        </p>
        <button
          onClick={onStartTest}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          Take a Test
        </button>
      </div>
    </div>
  );
}
