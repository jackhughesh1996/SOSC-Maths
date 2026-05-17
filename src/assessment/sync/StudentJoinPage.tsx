import React, { useState } from 'react';
import { 
  LogIn, 
  Loader2, 
  Users, 
  Timer,
  BookOpen,
  ArrowRight,
  Wifi
} from 'lucide-react';
import { useTeacherStart } from './useTeacherStart';
import { StandaloneTestRunner } from '../runner/StandaloneTestRunner';
import { DynamicTestManifest, TestSubmission } from '../schema/DynamicTestTypes';

interface StudentJoinPageProps {
  // In a real app we might fetch the manifest based on the sessionId
  // For this prototype, we'll assume we have a demo manifest to use if the server says it's valid
  demoManifest: DynamicTestManifest;
}

export function StudentJoinPage({ demoManifest }: StudentJoinPageProps) {
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');

  const { data: syncData, error: syncError } = useTeacherStart(activeSessionId);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionIdInput || !studentName) return;

    setIsJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/sessions/${sessionIdInput.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName })
      });

      if (!res.ok) throw new Error("Session not found or inactive.");
      
      setActiveSessionId(sessionIdInput.toUpperCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  const handleComplete = async (submission: TestSubmission) => {
    if (!activeSessionId) return;
    try {
        await fetch(`/api/sessions/${activeSessionId}/submit`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...submission, studentName })
        });
    } catch (err) {
        console.error("Failed to submit result to session", err);
    }
  };

  if (activeSessionId) {
    if (syncData?.status === 'started') {
      return (
        <StandaloneTestRunner 
          manifest={{
             ...demoManifest,
             delivery: {
                ...demoManifest.delivery,
                // Override with server-provided start time if needed, 
                // but StandaloneTestRunner uses internal timer. 
                // For a true sync we'd sync the duration.
                durationSeconds: syncData.durationSeconds || demoManifest.delivery.durationSeconds
             }
          }}
          onComplete={handleComplete}
          onExit={() => window.location.reload()}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 relative">
              <Loader2 className="w-10 h-10 animate-spin opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Wifi className="w-8 h-8 animate-pulse" />
              </div>
           </div>

           <h2 className="text-2xl font-black text-slate-900 mb-2">Connected: {activeSessionId}</h2>
           <p className="text-slate-500 font-medium mb-10">Waiting for your teacher to start the session...</p>
           
           <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl text-left border border-slate-100 group">
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <Users className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</div>
                    <div className="text-slate-900 font-bold">{studentName}</div>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl text-left border border-slate-100 group">
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                    <BookOpen className="w-6 h-6" />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</div>
                    <div className="text-slate-900 font-bold truncate max-w-[200px]">{demoManifest.title}</div>
                 </div>
              </div>
           </div>

           {(error || syncError) && (
              <div className="mt-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 italic">
                 {error || syncError}
              </div>
           )}

           <div className="mt-10 pt-10 border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                 The timer will begin automatically once the teacher broadcasts the signal.
              </p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
       <div className="max-w-md w-full">
          <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
                <BookOpen className="w-8 h-8 text-indigo-600" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Join Session</h1>
             <p className="text-slate-500 font-medium">Enter your code to connect to the live assessment.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
             <form onSubmit={handleJoin} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Session Code</label>
                   <input 
                     type="text"
                     value={sessionIdInput}
                     onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
                     placeholder="E.G. XJ39A1"
                     className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-2xl font-black tracking-widest text-center focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all placeholder:text-slate-200 placeholder:tracking-normal"
                     maxLength={6}
                     required
                   />
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Student Name</label>
                   <input 
                     type="text"
                     value={studentName}
                     onChange={(e) => setStudentName(e.target.value)}
                     placeholder="Enter your full name"
                     className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all"
                     required
                   />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                     {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                   {isJoining ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Connect to Session <ArrowRight className="w-6 h-6" /></>}
                </button>
             </form>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-4 text-slate-400">
             <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-slate-300" />
             <div className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Start</span>
             </div>
          </div>
       </div>
    </div>
  );
}
