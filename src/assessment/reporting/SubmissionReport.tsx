import React from 'react';
import { TestSubmission, QuestionResponse } from '../schema/DynamicTestTypes';
import { CheckCircle2, XCircle, HelpCircle, AlertCircle, Clock, Hash, FileText } from 'lucide-react';

interface SubmissionReportProps {
  submission: TestSubmission;
}

/**
 * A print-optimized report component.
 * This should be rendered in a hidden way or on a dedicated page
 * and triggered via window.print().
 */
export const SubmissionReport: React.FC<SubmissionReportProps> = ({ submission }) => {
  const { student, attempt, score, responses, rubrics, monitoring } = submission;

  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="bg-white text-slate-900 p-8 max-w-[21cm] mx-auto print:m-0 print:p-8 print:max-w-none print:shadow-none font-sans" id="printable-report">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Assessment Report</h1>
          <h2 className="text-xl font-bold text-slate-600">{submission.testId}</h2>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-400 tracking-widest uppercase">Student Result</div>
          <div className="text-4xl font-black">{Math.round(score.percent)}%</div>
        </div>
      </header>

      {/* Info Grid */}
      <section className="grid grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Student Information
            </div>
            <div className="text-lg font-bold">{student.name}</div>
            <div className="text-sm text-slate-500">{student.studentId || 'No Student ID provided'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Attempt Timeline
            </div>
            <div className="text-sm"><strong>Started:</strong> {formatDate(attempt.startedAt)}</div>
            <div className="text-sm"><strong>Submitted:</strong> {formatDate(attempt.submittedAt)}</div>
            <div className="text-sm"><strong>Duration:</strong> {Math.floor(attempt.durationSeconds / 60)}m {attempt.durationSeconds % 60}s ({attempt.submitReason})</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> Technical Audit
            </div>
            <div className="text-xs font-mono text-slate-500">ID: {attempt.attemptId}</div>
            <div className="text-xs font-mono text-slate-500">Seed: {attempt.seed}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Integrity Summary</div>
            <div className="text-sm space-y-1">
              <div>Switches: {monitoring.tabTracking.hiddenEventCount}</div>
              <div>Time Hidden: {monitoring.tabTracking.totalHiddenSeconds}s</div>
              {monitoring.tabTracking.flags.map((f: string, i: number) => (
                <div key={i} className="text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Rubrics */}
      <section className="mb-12">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Competency Alignment</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-xs font-bold text-slate-400 uppercase">
              <th className="py-2">Skill / Strand</th>
              <th className="py-2 text-center">Mastery</th>
              <th className="py-2 text-center">Marks</th>
              <th className="py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rubrics.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-4 pr-4">
                  <div className="font-bold">{r.skillName}</div>
                  <div className="text-xs text-slate-500">ID: {r.skillId}</div>
                </td>
                <td className="py-4 text-center">
                  <span className="inline-block px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded">
                    {r.masteryBand}
                  </span>
                </td>
                <td className="py-4 text-center font-medium">
                  {r.marksAwarded} / {r.maxMarks}
                  {r.assistedCorrectCount > 0 && <span className="text-[10px] text-amber-600 block">({r.assistedCorrectCount} assisted)</span>}
                </td>
                <td className="py-4 text-right font-black">
                  {Math.round(r.percent)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="print:break-before-page" />

      {/* Transcript */}
      <section>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Question Transcript</h3>
        <div className="space-y-10">
          {responses.map((resp: QuestionResponse, idx: number) => (
            <div key={resp.questionId} className="relative pl-12 pb-10 border-l border-slate-100 last:pb-0">
              {/* Question Marker */}
              <div className="absolute left-[-1.25rem] top-0 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                {idx + 1}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    Question ID: {resp.questionId}
                  </div>
                  <div className="flex items-center gap-2">
                    {resp.isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3 h-3" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded">
                        <XCircle className="w-3 h-3" /> Incorrect
                      </span>
                    )}
                    {resp.assisted && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <HelpCircle className="w-3 h-3" /> Assisted
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-slate-700 italic border-l-4 border-slate-100 pl-4 py-2">
                   {resp.promptRendered}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Student Answer</div>
                    <div className="font-mono text-sm">{resp.studentLatex}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Eval: {resp.studentEvalText}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Answer</div>
                    <div className="font-mono text-sm">{resp.correctEvalText}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Method: {resp.gradingMethod}</div>
                  </div>
                </div>

                {resp.hintsUsed.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <strong>Hints Used:</strong> Levels {resp.hintsUsed.join(', ')}
                  </div>
                )}

                <div className="text-xs flex gap-4 text-slate-400">
                  <span>Marks: {resp.marksAwarded} / {resp.maxMarks}</span>
                  <span>Answered: {new Date(resp.answeredAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-slate-100 text-[10px] text-center text-slate-400 font-medium uppercase tracking-[0.2em] space-y-2">
        <div>End of Record • SOSC Maths Official Assessment Runtime</div>
        <div>Generated {formatDate(new Date().toISOString())}</div>
      </footer>

      {/* Global CSS for printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .prose {
            max-width: none !important;
          }
          math-field {
            border: none !important;
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
};
