import React from 'react';
import { Lightbulb, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { DynamicQuestion, ProgressiveHint } from '../../schema/DynamicTestTypes';

interface HintPanelProps {
  question: DynamicQuestion;
  revealedLevels: number[];
  onReveal: (level: number) => void;
}

export const HintPanel: React.FC<HintPanelProps> = ({ question, revealedLevels, onReveal }) => {
  const hints = [...question.hints].sort((a, b) => a.level - b.level);
  
  const getNextLevel = () => {
    const next = hints.find(h => !revealedLevels.includes(h.level));
    return next ? next.level : null;
  };

  const nextLevel = getNextLevel();

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {revealedLevels.map((level) => {
          const hint = hints.find(h => h.level === level);
          if (!hint) return null;

          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 shadow-sm"
            >
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-2 prose prose-sm prose-amber">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                  Level {level} Hint 
                  {hint.penalty?.markAsAssisted && ' • Partial marks apply'}
                </div>
                <Markdown>{hint.content.markdown}</Markdown>
                {hint.content.latex && (
                  <div className="bg-white/50 p-2 rounded-lg border border-amber-200/50">
                    <math-field 
                      read-only 
                      dangerouslySetInnerHTML={{ __html: hint.content.latex }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {nextLevel !== null && (
        <button
          onClick={() => onReveal(nextLevel)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors py-2 px-1 text-sm font-medium group"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Need a hint? (Level {nextLevel})</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {hints.length === 0 && (
        <div className="text-sm text-slate-400 italic px-1 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          No hints available for this question.
        </div>
      )}
    </div>
  );
};
