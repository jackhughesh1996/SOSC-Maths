import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ValidationMessage, ValidationResult } from '../../schema/DynamicTestTypes';

export type CreatorValidationTarget = 'settings' | 'rubric' | 'variables' | 'questions' | 'export' | 'validation';

interface ValidationPanelProps {
  validation: ValidationResult;
  onNavigate?: (tab: CreatorValidationTarget, questionId?: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ validation, onNavigate }) => {
  const errors = validation.messages.filter(m => m.type === "error");
  const warnings = validation.messages.filter(m => m.type === "warning");
  const infos = validation.messages.filter(m => m.type === "info");

  const handleLinkClick = (path?: string) => {
    if (!path || !onNavigate) return;
    
    // Naive path parser for navigation
    if (path.startsWith('questions')) {
      const match = path.match(/questions\[(\d+)\]/);
      if (match) {
        // We'd ideally need the ID mapping, but for now we might just go to questions tab
        onNavigate('questions');
      } else {
        onNavigate('questions');
      }
    } else if (path.startsWith('randomization')) {
      onNavigate('variables');
    } else if (path.startsWith('rubric')) {
      onNavigate('rubric');
    } else {
      onNavigate('settings');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Health</h2>
        <p className="text-slate-500 font-medium leading-relaxed">
          The validation engine checks for structural integrity, logical consistency, and standalone export readiness.
        </p>
      </div>

      {validation.isValid && errors.length === 0 && warnings.length === 0 && (
         <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
               <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-emerald-900">All Systems Nominal</h3>
               <p className="text-emerald-700/70 text-sm mt-1">This manifest conforms to mathgraph-test-v1 specifications.</p>
            </div>
         </div>
      )}

      {(errors.length > 0 || warnings.length > 0 || infos.length > 0) && (
        <div className="space-y-8">
           {/* Section: Errors */}
           {errors.length > 0 && (
             <section className="space-y-4">
                <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest">
                   <ShieldAlert className="w-4 h-4" /> Blocking Errors ({errors.length})
                </div>
                <div className="space-y-2">
                   {errors.map((m, i) => (
                     <ValidationRow key={i} message={m} onClick={() => handleLinkClick(m.path)} />
                   ))}
                </div>
             </section>
           )}

           {/* Section: Warnings */}
           {warnings.length > 0 && (
             <section className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest">
                   <AlertTriangle className="w-4 h-4" /> Optimization Warnings ({warnings.length})
                </div>
                <div className="space-y-2">
                   {warnings.map((m, i) => (
                     <ValidationRow key={i} message={m} onClick={() => handleLinkClick(m.path)} />
                   ))}
                </div>
             </section>
           )}

           {/* Section: Info */}
           {infos.length > 0 && (
             <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600 font-black text-xs uppercase tracking-widest">
                   <Info className="w-4 h-4" /> Manifest Insights ({infos.length})
                </div>
                <div className="space-y-2">
                   {infos.map((m, i) => (
                     <ValidationRow key={i} message={m} onClick={() => handleLinkClick(m.path)} />
                   ))}
                </div>
             </section>
           )}
        </div>
      )}
    </div>
  );
};

const ValidationRow: React.FC<{ message: ValidationMessage, onClick: () => void }> = ({ message, onClick }) => {
  const bgColor = {
    error: "bg-red-50 border-red-100 text-red-900",
    warning: "bg-amber-50 border-amber-100 text-amber-900",
    info: "bg-blue-50 border-blue-100 text-blue-900"
  }[message.type];

  const Icon = {
    error: ShieldAlert,
    warning: AlertTriangle,
    info: Info
  }[message.type];

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border ${bgColor} flex items-start gap-4 group cursor-pointer hover:scale-[1.01] transition-all`}
    >
       <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 shrink-0`}>
          <Icon className="w-4 h-4" />
       </div>
       <div className="flex-1">
          <div className="text-sm font-bold leading-tight">{message.message}</div>
          {message.path && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider opacity-60">
               {message.path} <ChevronRight className="w-2 h-2" /> <span className="underline decoration-dotted underline-offset-2">Fix in interface</span>
            </div>
          )}
       </div>
       <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3 h-3" />
       </div>
    </div>
  );
}
