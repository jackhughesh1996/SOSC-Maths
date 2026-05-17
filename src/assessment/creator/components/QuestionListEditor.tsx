import React from 'react';
import { Plus, GripVertical, FileText } from 'lucide-react';
import { DynamicTestManifest, DynamicQuestion } from '../../schema/DynamicTestTypes';

interface QuestionListEditorProps {
  manifest: DynamicTestManifest;
  activeQuestionId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onReorder: (newOrder: string[]) => void;
}

export const QuestionListEditor: React.FC<QuestionListEditorProps> = ({ 
  manifest, 
  activeQuestionId, 
  onSelect,
  onAdd,
  // onReorder is intended for future drag and drop implementation
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Stack</h3>
        <button
          onClick={onAdd}
          className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
          title="Add New Question"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {manifest.questions.map((q, idx) => {
          const isActive = activeQuestionId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                isActive ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 truncate">
                <div className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {q.id}
                </div>
                <div className={`text-[10px] truncate ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                  {q.type} • {q.rubric.skillId || 'No Skill'}
                </div>
              </div>
              <FileText className={`w-4 h-4 ${isActive ? 'text-white/20' : 'text-slate-200 opacity-0 group-hover:opacity-100'}`} />
            </button>
          );
        })}
      </div>

      <button
        onClick={onAdd}
        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all text-sm font-bold mt-4"
      >
        <Plus className="w-4 h-4" /> Add New Item
      </button>
    </div>
  );
};
