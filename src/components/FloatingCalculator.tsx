import React, { useRef } from 'react';
import { Calculator } from './Calculator';
import { X, GripHorizontal } from 'lucide-react';
import { motion, useDragControls } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  allowAdvanced?: boolean;
  allowHistory?: boolean;
  onEvaluate?: (expression: string, result: string) => void;
}

export function FloatingCalculator({ isOpen, onClose, allowAdvanced, allowHistory, onEvaluate }: FloatingCalculatorProps) {
  const dragControls = useDragControls();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!isOpen) return null;

  if (!isDesktop) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-[50]" onClick={onClose} />
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[51] flex flex-col bg-white rounded-t-2xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase flex-1">Calculator</span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close Calculator"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto [&>div]:border-none [&>div]:shadow-none [&>div]:rounded-none">
            <Calculator 
              allowAdvanced={allowAdvanced} 
              allowHistory={allowHistory} 
              onEvaluate={onEvaluate} 
            />
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-[50] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      style={{ 
        width: 320, 
        height: 500,
        minWidth: 280,
        minHeight: 400,
        resize: 'both',
        touchAction: 'none' 
      }}
    >
      <div 
        className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripHorizontal size={16} className="text-gray-400 pointer-events-none" />
        <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase flex-1 text-center select-none pointer-events-none">Calculator</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10 cursor-pointer"
          aria-label="Close Calculator"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={16} />
        </button>
      </div>
      {/* Overrides inner Calculator border, shadow, and rounded corners so it blends with this wrapper */}
      <div className="flex-1 [&>div]:border-none [&>div]:shadow-none [&>div]:rounded-none">
        <Calculator 
          allowAdvanced={allowAdvanced} 
          allowHistory={allowHistory} 
          onEvaluate={onEvaluate} 
        />
      </div>
    </motion.div>
  );
}
