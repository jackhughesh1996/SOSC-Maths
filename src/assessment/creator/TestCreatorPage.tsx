import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  ListChecks, 
  Variable, 
  MessageSquare, 
  FileCode, 
  Download, 
  Eye, 
  ChevronLeft,
  Blocks,
  Sparkles,
  Upload,
  RefreshCw,
  Library,
  AlertTriangle,
  X,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { DynamicTestManifest, DynamicQuestion, validateDynamicTestManifest } from '../schema/DynamicTestTypes';
import { TestSettingsPanel } from './components/TestSettingsPanel';
import { RubricEditor } from './components/RubricEditor';
import { RandomVariableEditor } from './components/RandomVariableEditor';
import { QuestionListEditor } from './components/QuestionListEditor';
import { QuestionEditor } from './components/QuestionEditor';
import { ManifestPreview } from './components/ManifestPreview';
import { ExportPanel } from './components/ExportPanel';
import { CreatorValidationTarget, ValidationPanel } from './components/ValidationPanel';
import { ResolvedQuestionPreview } from './components/ResolvedQuestionPreview';
import { StandaloneTestRunner } from '../runner/StandaloneTestRunner';
import { DEMO_MANIFEST } from '../demoManifest';
import * as Demos from '../examples';

const STORAGE_KEY = 'mathgraph_creator_draft';

const INITIAL_MANIFEST: DynamicTestManifest = {
  schemaVersion: "mathgraph-test-v1",
  testId: `test-${Date.now()}`,
  title: "New Assessment",
  description: "",
  engine: {
    mathUtilsVersion: "2026-05-16",
    gradingVersion: "v1"
  },
  delivery: {
    mode: "standalone",
    durationSeconds: 1800,
    autoSubmitOnExpiry: true,
    allowPause: false,
    requireStudentName: true,
    startMode: "studentManual"
  },
  security: {
    trackTabVisibility: true,
    trackFocusBlur: true,
    warnOnHidden: true,
    maxHiddenSecondsBeforeFlag: 30,
    maxHiddenEventsBeforeFlag: 3
  },
  randomization: {
    seedPolicy: "perStudent",
    variables: {}
  },
  rubric: {
    skills: [],
    masteryBands: [
      { id: "em", minPercent: 0, label: "Emerging" },
      { id: "sec", minPercent: 75, label: "Secure" }
    ]
  },
  questions: [],
  flow: {
    entryQuestionIds: [],
    navigation: "linear",
    allowBacktracking: false
  },
  reporting: {
    includeRubricAlignment: true,
    includeHintUsage: true,
    includeTabTracking: true,
    includeQuestionTranscript: true
  }
};

type EditorTab = 'settings' | 'rubric' | 'variables' | 'questions' | 'export' | 'validation';

export const TestCreatorPage: React.FC = () => {
  const [manifest, setManifest] = useState<DynamicTestManifest>(INITIAL_MANIFEST);
  const [activeTab, setActiveTab] = useState<EditorTab>('settings');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence: Load Draft
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validation = validateDynamicTestManifest(parsed);
        if (validation.isValid) {
          setManifest(parsed);
        }
      } catch (e) {
        console.error("Failed to load draft", e);
      }
    }
  }, []);

  // Persistence: Save Draft
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manifest));
  }, [manifest]);

  const updateManifest = (updates: Partial<DynamicTestManifest>) => {
    setManifest(prev => ({ ...prev, ...updates }));
  };

  const resetToBlank = () => {
    if (confirm("Clear all work and start a blank test?")) {
      setManifest({ ...INITIAL_MANIFEST, testId: `test-${Date.now()}` });
      setActiveQuestionId(null);
      setActiveTab('settings');
    }
  };

  const loadManifest = (newManifest: DynamicTestManifest, name: string) => {
    if (confirm(`Replace current work with ${name}?`)) {
      setManifest(newManifest);
      setActiveQuestionId(newManifest.questions[0]?.id || null);
      setActiveTab('settings');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const validation = validateDynamicTestManifest(parsed);
        
        if (validation.isValid) {
          setManifest(parsed);
          setImportErrors([]);
          setActiveTab('settings');
        } else {
          setImportErrors(validation.errors);
        }
      } catch (err) {
        setImportErrors(["Invalid JSON file format"]);
      }
    };
    reader.readAsText(file);
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addQuestion = () => {
    const id = `q${manifest.questions.length + 1}`;
    const newQuestion: DynamicQuestion = {
      id,
      type: 'mathInput',
      prompt: { markdown: 'Enter question text here...' },
      display: { answerField: 'mathlive' },
      answer: { format: 'number', correct: '0' },
      grading: {
        mode: 'numericExact',
        marks: { correct: 1, assistedCorrect: 0.5, incorrect: 0 },
        feedback: { correct: 'Correct', incorrect: 'Incorrect' }
      },
      hints: [],
      rubric: { skillId: '', level: 1, maxMarks: 1 }
    };

    setManifest(prev => {
      const nextQuestions = [...prev.questions, newQuestion];
      return {
        ...prev,
        questions: nextQuestions,
        flow: {
          ...prev.flow,
          entryQuestionIds: prev.questions.length === 0 ? [id] : prev.flow.entryQuestionIds
        }
      };
    });
    setActiveQuestionId(id);
    setActiveTab('questions');
  };

  const updateQuestion = (id: string, updates: Partial<DynamicQuestion>) => {
    setManifest(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const removeQuestion = (id: string) => {
    setManifest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
      flow: {
        ...prev.flow,
        entryQuestionIds: prev.flow.entryQuestionIds.filter(eid => eid !== id)
      }
    }));
    if (activeQuestionId === id) setActiveQuestionId(null);
  };

  const activeQuestion = manifest.questions.find(q => q.id === activeQuestionId);

  const validation = validateDynamicTestManifest(manifest);
  const errorCount = validation.messages.filter(m => m.type === "error").length;
  const warningCount = validation.messages.filter(m => m.type === "warning").length;

  if (isPreview) {
    return (
       <div className="flex flex-col h-screen overflow-hidden">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-2xl z-50">
             <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold tracking-tight">Assessment Preview Mode</span>
             </div>
             <button 
               onClick={() => setIsPreview(false)}
               className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
             >
                <ChevronLeft className="w-4 h-4" /> Exit Preview
             </button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-50">
             <StandaloneTestRunner 
                manifest={manifest} 
                onExit={() => setIsPreview(false)}
                onComplete={(s) => console.log('Preview Complete Submission:', s)}
             />
          </div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
               <Blocks className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">SOSC Maths</h1>
               <div className="text-slate-900 font-bold truncate max-w-[200px] md:max-w-md">{manifest.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
               onClick={() => setIsPreview(true)}
               disabled={manifest.questions.length === 0}
               className="hidden md:flex items-center gap-2 bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900 px-4 py-2 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
             >
                <Eye className="w-4 h-4" /> Preview Test
             </button>
             <button
               onClick={() => setActiveTab('export')}
               className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md"
             >
                <Download className="w-4 h-4" /> Export
             </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Left Pane) - Test Structure */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 hidden lg:flex">
          <div className="p-5 border-b border-slate-50">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Core Editor</h3>
             <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'settings' ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                   <Settings className="w-5 h-5 flex-shrink-0" /> Config & Security
                </button>
                <button 
                  onClick={() => setActiveTab('rubric')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'rubric' ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                   <ListChecks className="w-5 h-5 flex-shrink-0" /> Rubric Alignment
                </button>
                <button 
                  onClick={() => setActiveTab('variables')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${activeTab === 'variables' ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                   <Variable className="w-5 h-5 flex-shrink-0" /> Randomization
                </button>
             </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-hide border-b border-slate-50">
             <QuestionListEditor 
                manifest={manifest}
                activeQuestionId={activeQuestionId}
                onSelect={(id) => {
                  setActiveQuestionId(id);
                  setActiveTab('questions');
                }}
                onAdd={addQuestion}
                onReorder={() => {}}
             />
          </div>

          <div className="p-5 space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 transition-all group"
                >
                   <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Import</span>
                </button>
                <button 
                  onClick={resetToBlank}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 transition-all group"
                >
                   <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
                </button>
             </div>
             <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sample Library</h3>
                <div className="grid grid-cols-1 gap-1">
                   <button 
                     onClick={() => loadManifest(Demos.LINEAR_EQUATIONS_DEMO, 'Linear Equations')}
                     className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all text-left font-black text-[9px] uppercase tracking-wider"
                   >
                      <Library className="w-3 h-3" /> Linear Equations
                   </button>
                   <button 
                     onClick={() => loadManifest(Demos.GRAPHING_DEMO, 'Graphing')}
                     className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all text-left font-black text-[9px] uppercase tracking-wider"
                   >
                      <Library className="w-3 h-3" /> Graphing Features
                   </button>
                   <button 
                     onClick={() => loadManifest(Demos.NUMERACY_DEMO, 'Numeracy')}
                     className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-left font-black text-[9px] uppercase tracking-wider"
                   >
                      <Library className="w-3 h-3" /> Numeracy & Precision
                   </button>
                </div>
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept=".json" 
               onChange={handleImport} 
             />
          </div>
        </aside>

        {/* Main Editor (Center Pane) */}
        <main className="flex-1 overflow-y-auto p-8 relative bg-slate-50/50">
          <div className="max-w-4xl mx-auto w-full pb-20">
            {importErrors.length > 0 && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                       <AlertTriangle className="w-4 h-4" /> Import Failed: Validation Errors
                    </div>
                    <button onClick={() => setImportErrors([])} className="text-red-400 hover:text-red-600">
                       <X className="w-4 h-4" />
                    </button>
                 </div>
                 <p className="text-xs text-red-600 pl-6">The imported manifest contains {importErrors.length} blocking errors.</p>
              </div>
            )}
            
            {activeTab === 'settings' && <TestSettingsPanel manifest={manifest} onChange={updateManifest} />}
            {activeTab === 'rubric' && <RubricEditor manifest={manifest} onChange={updateManifest} />}
            {activeTab === 'variables' && <RandomVariableEditor manifest={manifest} onChange={updateManifest} />}
            {activeTab === 'questions' && activeQuestion && (
              <QuestionEditor 
                question={activeQuestion}
                manifest={manifest}
                onChange={(upd) => updateQuestion(activeQuestion.id, upd)}
                onRemove={() => removeQuestion(activeQuestion.id)}
              />
            )}
            {activeTab === 'questions' && !activeQuestion && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <MessageSquare className="w-10 h-10" />
                 </div>
                 <div className="max-w-xs space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">No question selected</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">Select a question from the left panel or create a new one to begin.</p>
                 </div>
                 <button 
                   onClick={addQuestion}
                   className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
                 >
                    <Plus className="w-4 h-4" /> New Question
                 </button>
              </div>
            )}
            {activeTab === 'export' && (
              <div className="space-y-8">
                 <ManifestPreview manifest={manifest} />
                 <ExportPanel manifest={manifest} />
              </div>
            )}
          </div>
        </main>

        {/* Utility / Health Guard (Right Pane) */}
        <aside className="w-[450px] bg-white border-l border-slate-200 flex flex-col overflow-y-auto hidden xl:flex p-6">
           <div className="mb-8 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Utility Panel</h3>
              <div className="flex items-center gap-2">
                 {(errorCount > 0 || warningCount > 0) && (
                   <div className={`px-2 py-1 rounded-lg text-[10px] font-black tabular-nums flex items-center gap-1.5 ${errorCount > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      <ShieldAlert className="w-3 h-3" /> {errorCount + warningCount} ISSUES
                   </div>
                 )}
              </div>
           </div>

           <div className="space-y-10">
              {activeTab === 'questions' && activeQuestion && (
                <ResolvedQuestionPreview 
                   question={activeQuestion} 
                   manifest={manifest} 
                />
              )}

              <ValidationPanel 
                 validation={validation} 
                 onNavigate={(tab: CreatorValidationTarget, qId) => {
                   setActiveTab(tab);
                   if (qId) setActiveQuestionId(qId);
                 }} 
              />
           </div>
        </aside>
      </div>

      <div className="mt-8 pb-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
         <FileCode className="w-3 h-3" /> Visual Manifest Builder • alpha 0.1
      </div>
    </div>
  );
};
