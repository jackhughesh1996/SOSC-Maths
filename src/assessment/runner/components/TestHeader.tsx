import React from 'react';
import { Clock, User } from 'lucide-react';
import { motion } from 'motion/react';

interface TestHeaderProps {
  title: string;
  studentName: string;
  remainingSeconds: number;
  progress: {
    current: number;
    total: number;
  };
}

export const TestHeader: React.FC<TestHeaderProps> = ({ 
  title, 
  studentName, 
  remainingSeconds, 
  progress 
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = remainingSeconds < 300; // 5 minutes

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="font-bold text-slate-900 truncate max-w-md">{title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>{studentName}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="text-sm font-medium text-slate-600">
              Question {progress.current} of {progress.total}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
            <motion.div 
              className="h-full bg-slate-900"
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border transition-colors ${
            isLowTime 
              ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-500' : 'text-slate-500'}`} />
            {formatTime(remainingSeconds)}
          </div>
        </div>
      </div>
    </header>
  );
};
