import React from 'react';
import { GitBranch, CornerDownRight } from 'lucide-react';
import { DynamicQuestion } from '../../schema/DynamicTestTypes';

interface AdaptiveFlowEditorProps {
  question: DynamicQuestion;
  allQuestionIds: string[];
  onChange: (updates: Partial<DynamicQuestion['adaptive']>) => void;
}

export const AdaptiveFlowEditor: React.FC<AdaptiveFlowEditorProps> = ({ 
  question, 
  allQuestionIds, 
  onChange 
}) => {
  const adaptive = question.adaptive || {};

  return (
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <GitBranch className="w-3 h-3" /> Adaptive Routing logic
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-emerald-600 mb-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> If Correct
          </div>
          <select
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
            value={adaptive.onCorrect || ''}
            onChange={(e) => onChange({ onCorrect: e.target.value || undefined })}
          >
            <option value="">(Standard Next)</option>
            {allQuestionIds.filter(id => id !== question.id).map(id => (
              <option key={id} value={id}>GOTO {id}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" /> If Incorrect
          </div>
          <select
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm"
            value={adaptive.onIncorrect || ''}
            onChange={(e) => onChange({ onIncorrect: e.target.value || undefined })}
          >
            <option value="">(Standard Next)</option>
            {allQuestionIds.filter(id => id !== question.id).map(id => (
              <option key={id} value={id}>GOTO {id}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
        <CornerDownRight className="w-4 h-4 text-indigo-400" />
        <div className="flex-1">
          <div className="text-xs font-bold text-indigo-700">Pre-requisite Remediation</div>
          <select
            className="w-full bg-transparent border-none p-0 text-sm italic text-indigo-900 focus:ring-0"
            value={adaptive.prerequisiteQuestionId || ''}
            onChange={(e) => onChange({ prerequisiteQuestionId: e.target.value || undefined })}
          >
            <option value="">No prerequisite assigned</option>
            {allQuestionIds.filter(id => id !== question.id).map(id => (
              <option key={id} value={id}>Requires passing {id} first</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
