import React from 'react';
import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { ProgressiveHint } from '../../schema/DynamicTestTypes';

type HintKind = ProgressiveHint['kind'];

const HINT_KINDS: HintKind[] = ['conceptual', 'method', 'workedStep', 'answerReveal'];

const toHintKind = (value: string): HintKind =>
  HINT_KINDS.includes(value as HintKind) ? (value as HintKind) : 'conceptual';

interface HintEditorProps {
  hints: ProgressiveHint[];
  onChange: (hints: ProgressiveHint[]) => void;
}

export const HintEditor: React.FC<HintEditorProps> = ({ hints, onChange }) => {
  const addHint = () => {
    const level = (Math.min(3, hints.length + 1)) as 1 | 2 | 3;
    onChange([...hints, {
      level,
      kind: 'conceptual',
      content: { markdown: '' }
    }]);
  };

  const removeHint = (index: number) => {
    onChange(hints.filter((_, i) => i !== index));
  };

  const updateHint = (index: number, updates: Partial<ProgressiveHint>) => {
    onChange(hints.map((h, i) => i === index ? { ...h, ...updates } : h));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Progressive Hints</label>
        <button
          onClick={addHint}
          className="text-xs font-bold text-slate-900 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Hint
        </button>
      </div>

      <div className="space-y-4">
        {hints.map((hint, idx) => (
          <div key={idx} className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl relative group">
            <button
              onClick={() => removeHint(idx)}
              className="absolute top-3 right-3 text-amber-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold">
                {hint.level}
              </div>
              <select
                className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 text-amber-700"
                value={hint.kind}
                onChange={(e) => updateHint(idx, { kind: toHintKind(e.target.value) })}
              >
                <option value="conceptual">Conceptual (No Penalty)</option>
                <option value="method">Method / Step (Partial Penalty)</option>
                <option value="workedStep">Worked Step</option>
                <option value="answerReveal">Answer Reveal (Heavy Penalty)</option>
              </select>
            </div>

            <textarea
              className="w-full bg-white border border-amber-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-amber-500"
              rows={2}
              placeholder="Hint content (Markdown supported)..."
              value={hint.content.markdown}
              onChange={(e) => updateHint(idx, { content: { ...hint.content, markdown: e.target.value } })}
            />

            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                <input
                  type="checkbox"
                  className="rounded text-amber-600 focus:ring-amber-500"
                  checked={hint.penalty?.markAsAssisted}
                  onChange={(e) => updateHint(idx, { 
                    penalty: { ...hint.penalty, markAsAssisted: e.target.checked }
                  })}
                />
                Mark as 'Assisted' when revealed
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
