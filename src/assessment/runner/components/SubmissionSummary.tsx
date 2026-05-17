import React from 'react';
import { 
  Trophy, 
  Download, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Printer
} from 'lucide-react';
import { motion } from 'motion/react';
import { TestSubmission } from '../../schema/DynamicTestTypes';
import { SubmissionReport } from '../../reporting/SubmissionReport';

interface SubmissionSummaryProps {
  submission: TestSubmission;
  onClose?: () => void;
}

export const SubmissionSummary: React.FC<SubmissionSummaryProps> = ({ submission, onClose }) => {
  const { score, attempt, rubrics, responses } = submission;
  const percentRounded = Math.round(score.percent);

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submission, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `submission-${submission.testId}-${attempt.attemptId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 print:hidden"
      >
        <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
            className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm"
          >
            <Trophy className="w-12 h-12 text-amber-400" />
          </motion.div>
          <h2 className="text-4xl font-black mb-2">Well done, {submission.student.name}!</h2>
          <p className="text-slate-400 mb-8">Submission reference: {attempt.attemptId}</p>
          
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-white">{percentRounded}%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Final Score</div>
            </div>
            <div className="w-px h-12 bg-white/10 self-center" />
            <div className="text-center">
              <div className="text-4xl font-black text-white">{score.rawMarks}/{score.maxMarks}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Marks</div>
            </div>
            {score.assistedQuestions > 0 && (
              <>
                <div className="w-px h-12 bg-white/10 self-center" />
                <div className="text-center">
                  <div className="text-4xl font-black text-amber-400">{score.assistedQuestions}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Assisted</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-10 space-y-12">
          {/* Rubric Breakdown */}
          <section>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Skill Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rubrics.map((r, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{r.skillName}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1 bg-slate-200/50 rounded-md inline-block">
                      {r.masteryBand}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{Math.round(r.percent)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Time & Security */}
          <section className="bg-slate-50 rounded-2xl p-6 flex flex-wrap items-center justify-around gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</div>
                <div className="font-bold text-slate-900">{Math.floor(attempt.durationSeconds / 60)}m {attempt.durationSeconds % 60}s</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {submission.monitoring.tabTracking.flags.length > 0 ? (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Integrity</div>
                <div className="font-bold text-slate-900">
                  {submission.monitoring.tabTracking.flags.length > 0 ? 'Review Required' : 'Verified Session'}
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <button
              onClick={downloadJson}
              className="flex-1 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              <Download className="w-5 h-5" />
              Download Result JSON
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white text-slate-900 border-2 border-slate-200 font-bold py-4 px-6 rounded-2xl transition-all hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Report / PDF
            </button>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Version {submission.schemaVersion} • Hash {submission.manifestHash.substring(0, 12)}
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1 uppercase tracking-widest"
            >
              Return Home <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Hidden for screen, visible for print */}
      <div className="hidden print:block overflow-visible h-auto">
        <SubmissionReport submission={submission} />
      </div>
    </div>
  );
};

