import React from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { motion, useDragControls } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { GraphingCalculator } from './GraphingCalculator';

interface FloatingGraphProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingGraph({ isOpen, onClose }: FloatingGraphProps) {
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
          style={{ height: '80vh' }}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase flex-1">Graphing</span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close Graph"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <GraphingCalculator />
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-[50] flex flex-col bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden border border-gray-200"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      style={{ 
        width: 700, 
        height: 500,
        minWidth: 400,
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
        <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase flex-1 text-center select-none pointer-events-none">Graphing</span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-10 cursor-pointer"
          aria-label="Close Graph"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <GraphingCalculator />
      </div>
    </motion.div>
  );
}
