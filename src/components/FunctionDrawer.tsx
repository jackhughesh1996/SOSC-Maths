import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, FunctionSquare, Calculator } from 'lucide-react';

interface FunctionDrawerProps {
  onInsert: (latex: string) => void;
}

const GROUPS = [
  {
    name: 'Trigonometry',
    items: [
      { label: 'sin(x)', latex: '\\sin(x)' },
      { label: 'cos(x)', latex: '\\cos(x)' },
      { label: 'tan(x)', latex: '\\tan(x)' },
      { label: 'csc(x)', latex: '\\csc(x)' },
      { label: 'sec(x)', latex: '\\sec(x)' },
      { label: 'cot(x)', latex: '\\cot(x)' },
      { label: 'arcsin(x)', latex: '\\arcsin(x)' },
      { label: 'arccos(x)', latex: '\\arccos(x)' },
      { label: 'arctan(x)', latex: '\\arctan(x)' },
    ]
  },
  {
    name: 'Log, Exp & Roots',
    items: [
      { label: 'ln(x)', latex: '\\ln(x)' },
      { label: 'log₁₀(x)', latex: '\\log_{10}(x)' },
      { label: 'log₂(x)', latex: '\\log_{2}(x)' },
      { label: 'eˣ', latex: 'e^{x}' },
      { label: '10ˣ', latex: '10^{x}' },
      { label: '√x', latex: '\\sqrt{x}' },
      { label: '|x|', latex: '|x|' },
      { label: 'π', latex: '\\pi' },
    ]
  }
];

export function FunctionDrawer({ onInsert }: FunctionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-gray-200 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <Calculator size={14} /> : <FunctionSquare size={14} />}
          <span>{isOpen ? 'Close Tool Drawer' : 'Quick Insert Functions'}</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-4 max-h-[300px] overflow-y-auto">
              {GROUPS.map((group) => (
                <div key={group.name} className="space-y-1.5">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 px-1">
                    {group.name}
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    {group.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => onInsert(item.latex)}
                        className="px-2 py-1.5 text-xs text-center bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all font-mono"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
