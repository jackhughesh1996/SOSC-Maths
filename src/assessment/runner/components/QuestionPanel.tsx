import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { SendHorizonal } from 'lucide-react';
import { DynamicQuestion } from '../../schema/DynamicTestTypes';
import { AnswerInput } from './AnswerInput';
import { HintPanel } from './HintPanel';

interface QuestionPanelProps {
  question: DynamicQuestion;
  revealedLevels: number[];
  onRevealHint: (level: number) => void;
  onSubmit: (value: { latex: string; evalText: string }) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  revealedLevels,
  onRevealHint,
  onSubmit
}) => {
  const [answer, setAnswer] = useState({ latex: '', evalText: '' });

  // Reset answer when question changes
  useEffect(() => {
    setAnswer({ latex: '', evalText: '' });
  }, [question.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.evalText.trim()) {
      onSubmit(answer);
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto py-8 px-6 space-y-12"
    >
      <section className="space-y-6">
        <div className="prose prose-slate prose-lg max-w-none">
          <Markdown>{question.prompt.markdown}</Markdown>
        </div>
        
        {question.prompt.latex && (
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex justify-center">
            <math-field 
              read-only 
              dangerouslySetInnerHTML={{ __html: question.prompt.latex }}
              style={{ fontSize: '2rem', border: 'none', background: 'transparent' }} 
            />
          </div>
        )}
      </section>

      <div className="h-px bg-slate-100" />

      <section className="space-y-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnswerInput 
            question={question}
            value={answer}
            onChange={setAnswer}
            // If it's a multiple choice, we'd ideally get choices from randomization or metadata
            // For now, if q.answer.format is choice, we might have options in metadata
            choices={question.metadata?.choices || []}
          />

          <button
            type="submit"
            disabled={!answer.evalText.trim()}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            Check Answer
            <SendHorizonal className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <HintPanel 
          question={question}
          revealedLevels={revealedLevels}
          onReveal={onRevealHint}
        />
      </section>
    </motion.div>
  );
};
