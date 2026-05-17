import React from 'react';
import { Type, Target, Hash, Settings2, Trash2, AlertTriangle } from 'lucide-react';
import { DynamicQuestion, DynamicTestManifest, GradingRule } from '../../schema/DynamicTestTypes';
import { HintEditor } from './HintEditor';
import { AdaptiveFlowEditor } from './AdaptiveFlowEditor';

type QuestionType = DynamicQuestion['type'];
type RubricLevel = DynamicQuestion['rubric']['level'];
type GradingMode = GradingRule['mode'];

const QUESTION_TYPES: QuestionType[] = ['mathInput', 'multipleChoice'];
const GRADING_MODES: GradingMode[] = [
  'numericExact',
  'numericTolerance',
  'symbolicSimplify',
  'symbolicSampled',
  'multipleChoice',
  'manualReview'
];

const toQuestionType = (value: string): QuestionType =>
  QUESTION_TYPES.includes(value as QuestionType) ? (value as QuestionType) : 'mathInput';

const toRubricLevel = (value: string): RubricLevel => {
  const parsed = Number.parseInt(value, 10);
  return ([1, 2, 3, 4, 5] as RubricLevel[]).includes(parsed as RubricLevel)
    ? (parsed as RubricLevel)
    : 1;
};

const toGradingMode = (value: string): GradingMode =>
  GRADING_MODES.includes(value as GradingMode) ? (value as GradingMode) : 'numericExact';

const getChoices = (question: DynamicQuestion): Array<string | number> => question.metadata?.choices ?? [];

interface QuestionEditorProps {
  question: DynamicQuestion;
  manifest: DynamicTestManifest;
  onChange: (updates: Partial<DynamicQuestion>) => void;
  onRemove: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  question, 
  manifest, 
  onChange, 
  onRemove 
}) => {
  const allQuestionIds = manifest.questions.map(q => q.id);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold backdrop-blur-sm">
            {manifest.questions.findIndex(q => q.id === question.id) + 1}
          </div>
          <div>
            <input
              type="text"
              className="bg-transparent border-none p-0 text-white font-black text-xl focus:ring-0 w-32"
              value={question.id}
              onChange={(e) => onChange({ id: e.target.value.replace(/\s+/g, '-') })}
            />
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Unique Question ID
            </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 space-y-10">
        {/* Type & Prompt */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Type className="w-3 h-3" /> Input Format
              </label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold text-sm"
                value={question.type}
                onChange={(e) => onChange({ type: toQuestionType(e.target.value) })}
              >
                <option value="mathInput">Mathematical Handwriting (MathLive)</option>
                <option value="multipleChoice">Multiple Choice Buttons</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-500 font-medium italic">How the student provides their answer.</p>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Curriculum Skill Aligment
              </label>
              <select
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm font-bold"
                value={question.rubric.skillId}
                onChange={(e) => onChange({ rubric: { ...question.rubric, skillId: e.target.value } })}
              >
                <option value="">No specific skill selected</option>
                {manifest.rubric.skills.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-500 font-medium italic">Ties this question to your assessment rubric.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Question Prompt</label>
            <textarea
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 min-h-[100px] font-medium text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              value={question.prompt.markdown}
              placeholder="e.g. Solve for x: $x + {{a}} = {{b}}$"
              onChange={(e) => onChange({ prompt: { ...question.prompt, markdown: e.target.value } })}
            />
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] text-slate-500 font-medium italic">Supports Markdown and LaTeX ($...$). Use {"{{var}}"} for randomized values.</p>
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        {/* Answer & Grading */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-900 font-bold">
               <Hash className="w-5 h-5 text-slate-400" />
               Validation & Marking
             </div>
             {question.grading.mode.includes('symbolic') && !question.grading.sampling && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100">
                   <AlertTriangle className="w-3 h-3" /> Sampling Recommended
                </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Correct Answer Expression</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 font-mono text-sm bg-slate-50"
                  value={String(question.answer.correct)}
                  onChange={(e) => onChange({ answer: { ...question.answer, correct: e.target.value } })}
                  placeholder="e.g. {{a + b}}"
                />
                <p className="mt-1 text-[10px] text-slate-500 font-medium italic">The "True" value to compare student input against.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base Marks</label>
                   <input
                      type="number"
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold"
                      value={question.grading.marks.correct}
                      onChange={(e) => onChange({ grading: { ...question.grading, marks: { ...question.grading.marks, correct: parseInt(e.target.value) || 1 } } })}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1" title="Marks awarded if hints are used">Assisted Marks</label>
                   <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold"
                      value={question.grading.marks.assistedCorrect}
                      onChange={(e) => onChange({ grading: { ...question.grading, marks: { ...question.grading.marks, assistedCorrect: parseFloat(e.target.value) || 0 } } })}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Difficulty</label>
                   <input
                      type="number"
                      min="1"
                      max="5"
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm font-bold"
                      value={question.rubric.level}
                      onChange={(e) => onChange({ rubric: { ...question.rubric, level: toRubricLevel(e.target.value) } })}
                   />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Evaluation AI Model</label>
                  <select
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                    value={question.grading.mode}
                    onChange={(e) => onChange({ grading: { ...question.grading, mode: toGradingMode(e.target.value) } })}
                  >
                    <option value="numericExact">Strict Numerical (0.5 vs 1/2 is DIFFERENT)</option>
                    <option value="numericTolerance">Flexible Numerical (Accepts rounding errors)</option>
                    <option value="symbolicSimplify">Symbolic Simplification</option>
                    <option value="symbolicSampled">Symbolic Sampling</option>
                    <option value="multipleChoice">Static Choice Matching</option>
                    <option value="manualReview">Manual Review</option>
                  </select>
                  <p className="mt-1 text-[10px] text-slate-500 font-medium italic">Determines how smart the auto-grader is.</p>
               </div>
               {question.type === 'multipleChoice' && (
                 <div className="animate-in fade-in-0 duration-300">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Answer Choices (comma separated)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm"
                      value={getChoices(question).join(', ')}
                      onChange={(e) => onChange({ 
                        metadata: { 
                          ...question.metadata, 
                          choices: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        } 
                      })}
                    />
                 </div>
               )}
            </div>
          </div>
        </section>

        <div className="h-px bg-slate-100" />

        {/* Hints & Flow */}
        <section className="space-y-8">
           <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
              <Settings2 className="w-5 h-5 text-slate-400" />
              Advanced config
           </div>
           
           <HintEditor 
             hints={question.hints} 
             onChange={(hints) => onChange({ hints })} 
           />

           <AdaptiveFlowEditor 
             question={question} 
             allQuestionIds={allQuestionIds}
             onChange={(updates) => onChange({ adaptive: { ...question.adaptive, ...updates } })}
           />
        </section>
      </div>
    </div>
  );
};
