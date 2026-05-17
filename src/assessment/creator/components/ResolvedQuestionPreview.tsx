import React from 'react';
import { 
  Eye, 
  Hash, 
  Target, 
  Settings2, 
  Terminal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { DynamicQuestion, DynamicTestManifest } from '../../schema/DynamicTestTypes';
import { resolveRandomVariables, interpolateTemplate } from '../../runtime/randomization';
import Markdown from 'react-markdown';

interface ResolvedQuestionPreviewProps {
  question: DynamicQuestion;
  manifest: DynamicTestManifest;
}

export const ResolvedQuestionPreview: React.FC<ResolvedQuestionPreviewProps> = ({ question, manifest }) => {
  // Use a fixed "preview" seed for UI consistency unless user refreshes
  const [seed, setSeed] = React.useState("preview-seed-1");
  
  const resolvedVars = resolveRandomVariables(manifest.randomization.variables, seed);
  const resolvedPrompt = interpolateTemplate(question.prompt.markdown, resolvedVars);
  const resolvedAnswer = interpolateTemplate(String(question.answer.correct), resolvedVars);
  
  const skill = manifest.rubric.skills.find(s => s.id === question.rubric.skillId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-full sticky top-32">
      <div className="bg-indigo-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
           <Eye className="w-4 h-4" /> Student View
        </div>
        <button 
          onClick={() => setSeed(`seed-${Math.random()}`)}
          className="text-indigo-100 hover:text-white transition-colors"
          title="Regenerate random values"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Rendered Stem */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Display</div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 prose prose-slate max-w-none">
            <div className="markdown-body text-slate-800 font-medium">
              <Markdown>{resolvedPrompt}</Markdown>
            </div>
            
            {question.type === 'multipleChoice' && (
              <div className="mt-4 space-y-2">
                {(question.metadata?.choices || []).map((c, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium">
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">{String.fromCharCode(65 + i)}</div>
                    {interpolateTemplate(String(c), resolvedVars)}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'mathInput' && (
              <div className="mt-4 w-full h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                 Mathematical Input Field
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Truths */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grading Logic</div>
             <div className="px-2 py-1 rounded bg-slate-900 text-[10px] font-black text-white uppercase tracking-wider">
                {question.grading.mode}
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
               <Hash className="w-4 h-4 text-emerald-500 shrink-0" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-60">Resolved Answer</span>
                  <span className="text-sm font-bold font-mono">{resolvedAnswer}</span>
               </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
               <Target className="w-4 h-4 text-blue-500 shrink-0" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-60">Aligned Skill</span>
                  <span className="text-sm font-bold truncate">{skill?.name || 'Unassigned'}</span>
               </div>
            </div>
            
            {question.grading.marks.assistedCorrect > 0 && (
               <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                  <Settings2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase opacity-60">Assisted Credit</span>
                     <span className="text-sm font-bold">{question.grading.marks.assistedCorrect} / {question.grading.marks.correct} marks</span>
                  </div>
               </div>
            )}
          </div>
        </div>
        
        {/* Authoring Safeguards */}
        {(question.hints.length === 0 || (question.grading.mode.includes('symbolic') && !question.grading.sampling)) && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-2">
             <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Authoring Warnings</span>
             </div>
             <ul className="space-y-1">
                {question.hints.length === 0 && (
                  <li className="text-[11px] font-medium text-red-700 list-disc ml-4">No hints provided (reduces engagement)</li>
                )}
                {question.grading.mode.includes('symbolic') && !question.grading.sampling && (
                  <li className="text-[11px] font-medium text-red-700 list-disc ml-4">Missing sampling config for symbolic grading</li>
                )}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
};
