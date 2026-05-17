import React from 'react';
import { MathInput } from '../../../components/MathInput';
import { DynamicQuestion } from '../../schema/DynamicTestTypes';

interface AnswerInputProps {
  question: DynamicQuestion;
  value: { latex: string; evalText: string };
  onChange: (value: { latex: string; evalText: string }) => void;
  choices?: Array<string | number>;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({ 
  question, 
  value, 
  onChange,
  choices = []
}) => {
  if (question.type === 'multipleChoice') {
    return (
      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, idx) => {
          const choiceStr = String(choice);
          const isSelected = value.evalText === choiceStr;
          
          return (
            <button
              key={idx}
              onClick={() => onChange({ latex: choiceStr, evalText: choiceStr })}
              className={`p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 ${
                isSelected
                  ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                  : 'border-slate-200 hover:border-slate-400 bg-white'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-lg transition-colors ${isSelected ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                {choiceStr}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Answer</div>
      <MathInput
        value={value.latex}
        onChange={(latex, ascii) => onChange({ latex, evalText: ascii })}
        className="text-2xl min-h-[64px] flex items-center"
      />
    </div>
  );
};
