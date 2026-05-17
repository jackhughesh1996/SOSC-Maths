import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  QrCode,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DynamicTestManifest } from '../schema/DynamicTestTypes';

interface TeacherSessionPageProps {
  manifest: DynamicTestManifest;
}

interface TeacherSessionInfo {
  status: 'waiting' | 'started' | 'closed';
  studentCount: number;
  submissionCount: number;
  durationSeconds: number;
  startedAt?: string;
}

export function TeacherSessionPage({ manifest }: TeacherSessionPageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<TeacherSessionInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const createSession = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: manifest.testId,
          durationSeconds: manifest.delivery.durationSeconds
        })
      });
      const data = await res.json();
      setSessionId(data.sessionId);
    } catch (err) {
      console.error("Failed to create session", err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        setSessionInfo(data);
      } catch (err) {
        console.error("Failed to poll session", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const startSession = async () => {
    if (!sessionId) return;
    try {
       await fetch(`/api/sessions/${sessionId}/start`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to start session", err);
    }
  };

  const copyCode = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!sessionId) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
           <Users className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Sync Assessment</h2>
        <p className="text-slate-600 mb-10 leading-relaxed">
          Create a live session to sync student starts. Students will join using a short code and wait for your signal.
        </p>
        <button 
          onClick={createSession}
          disabled={isCreating}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
        >
          {isCreating ? 'Creating...' : <>Generate Session Code <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header Info */}
      <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 pointer-events-none">
            <QrCode className="w-48 h-48" />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">
               <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
               Live Session Active
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 truncate pr-20">{manifest.title}</h1>
            <p className="text-slate-500 font-medium mb-8">Ready to broadcast to connected clients.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex-1 flex flex-col items-center justify-center gap-2 group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Code</span>
                  <div className="flex items-center gap-3">
                     <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums selection:bg-indigo-100">{sessionId}</span>
                     <button 
                       onClick={copyCode}
                       className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                     >
                        {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                     </button>
                  </div>
               </div>
               <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 min-w-[200px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</span>
                  <div className="flex items-center gap-3 text-white">
                     <Users className="w-8 h-8 text-indigo-400" />
                     <span className="text-5xl font-black tracking-tighter tabular-nums">{sessionInfo?.studentCount || 0}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Control Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
               <Play className="w-4 h-4 text-indigo-600" /> Session Controls
            </h3>
            
            {sessionInfo?.status === 'waiting' ? (
              <div className="space-y-4">
                 <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Once all students have connected and are visible in the counter above, click "Start Assessment" to begin the synchronized timer.
                 </p>
                 <button 
                   onClick={startSession}
                   className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3"
                 >
                    <Play className="w-5 h-5 fill-current" /> Start Assessment
                 </button>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-700">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="font-black text-sm">Assessment in Progress</div>
                       <div className="text-xs opacity-75">Started at {sessionInfo?.startedAt ? new Date(sessionInfo.startedAt).toLocaleTimeString() : 'N/A'}</div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Time Limit</div>
                       <div className="text-slate-900 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {Math.floor((sessionInfo?.durationSeconds ?? 0) / 60)}m
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Submissions</div>
                       <div className="text-slate-900 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-indigo-500" /> {sessionInfo?.submissionCount || 0}
                       </div>
                    </div>
                 </div>
              </div>
            )}
         </div>

         <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
            <QrCode className="w-24 h-24 text-slate-300 mb-4" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Join Preview</span>
            <p className="text-[10px] text-slate-400 max-w-[200px]">
               Students join at <span className="font-bold text-slate-500 underline underline-offset-2">/join</span> or by scanning the session QR code.
            </p>
         </div>
      </div>
      
      {sessionInfo?.status === 'started' && (
         <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
               <h4 className="text-sm font-bold text-amber-900 mb-1">Live Monitoring</h4>
               <p className="text-xs text-amber-700 leading-relaxed">
                  Real-time proctoring events (tab blurs, focus loss) will be recorded in the final student transcripts once the session is completed and results are received.
               </p>
            </div>
         </div>
      )}
    </div>
  );
}
