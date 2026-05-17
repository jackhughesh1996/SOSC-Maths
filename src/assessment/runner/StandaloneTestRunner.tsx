import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { DynamicTestManifest, MonitoringSnapshot, SubmitReason, TestSubmission } from '../schema/DynamicTestTypes';
import { AttemptState, TestRuntime } from './TestRuntime';
import { TimerController } from './TimerController';
import { TabTracker } from './TabTracker';
import { StudentStartScreen } from './components/StudentStartScreen';
import { TestHeader } from './components/TestHeader';
import { QuestionPanel } from './components/QuestionPanel';
import { SubmissionSummary } from './components/SubmissionSummary';

interface StandaloneTestRunnerProps {
  manifest: DynamicTestManifest;
  onComplete?: (submission: TestSubmission) => void;
  onExit?: () => void;
}

export const StandaloneTestRunner: React.FC<StandaloneTestRunnerProps> = ({ 
  manifest, 
  onComplete,
  onExit 
}) => {
  const [attemptState, setAttemptState] = useState<AttemptState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(manifest.delivery.durationSeconds);
  const [currentSubmission, setCurrentSubmission] = useState<TestSubmission | null>(null);
  
  const timerRef = useRef<TimerController | null>(null);
  const trackerRef = useRef<TabTracker | null>(null);

  // Initialize Tab Tracker
  useEffect(() => {
    trackerRef.current = new TabTracker({
      maxHiddenSecondsBeforeFlag: manifest.security.maxHiddenSecondsBeforeFlag,
      maxHiddenEventsBeforeFlag: manifest.security.maxHiddenEventsBeforeFlag
    });

    return () => {
      trackerRef.current?.stop();
    };
  }, [manifest]);

  // Handle test start
  const handleStart = (studentName: string) => {
    const initialState = TestRuntime.initialiseAttempt(manifest, { name: studentName });
    setAttemptState(initialState);
    
    // Start tracking
    if (manifest.security.trackTabVisibility) {
      trackerRef.current?.start();
    }

    // Start timer
    timerRef.current = new TimerController(
      manifest.delivery.durationSeconds,
      (rem) => setRemainingSeconds(rem),
      () => finalizeTest('timerExpired')
    );
    timerRef.current.start(initialState.startedAt);
  };

  // Finalize the test
  const finalizeTest = (reason: SubmitReason) => {
    setAttemptState(prev => {
      if (!prev) return null;
      
      const monitoring: MonitoringSnapshot = {
        tabTracking: trackerRef.current?.summarize() ?? {
          hiddenEventCount: 0,
          totalHiddenSeconds: 0,
          longestHiddenSeconds: 0,
          focusLostCount: 0,
          flags: []
        },
        events: trackerRef.current?.getEvents() || []
      };

      const submission = TestRuntime.finalize(prev, manifest, reason, monitoring);
      setCurrentSubmission(submission);
      onComplete?.(submission);
      
      // Stop timer and tracker
      timerRef.current?.stop();
      trackerRef.current?.stop();
      
      return { ...prev, status: 'submitted' };
    });
  };

  const handleRevealHint = (level: number) => {
    if (!attemptState || !attemptState.currentQuestionId) return;
    setAttemptState(prev => prev ? TestRuntime.revealHint(prev, prev.currentQuestionId!, level, manifest) : null);
  };

  const handleSubmitAnswer = (answer: { latex: string; evalText: string }) => {
    if (!attemptState || !attemptState.currentQuestionId) return;

    const { state: nextState, result } = TestRuntime.submitAnswer(
      attemptState, 
      attemptState.currentQuestionId, 
      answer, 
      manifest
    );

    // Advance to next or end test
    const advancedState = TestRuntime.advance(nextState, manifest, result);
    
    if (advancedState.currentQuestionId === null) {
      finalizeTest('studentSubmit');
    } else {
      setAttemptState(advancedState);
    }
  };

  const currentQuestion = attemptState ? TestRuntime.getCurrentQuestion(attemptState, manifest) : null;

  // Render logic
  if (currentSubmission) {
    return <SubmissionSummary submission={currentSubmission} onClose={onExit} />;
  }

  if (!attemptState) {
    return <StudentStartScreen manifest={manifest} onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <TestHeader 
        title={manifest.title}
        studentName={attemptState.student.name}
        remainingSeconds={remainingSeconds}
        progress={{
          current: attemptState.visitedQuestionIds.length,
          total: manifest.questions.length // Simplified for linear, could be more complex for adaptive
        }}
      />

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionPanel 
              key={currentQuestion.id}
              question={currentQuestion}
              revealedLevels={attemptState.hintState[currentQuestion.id] || []}
              onRevealHint={handleRevealHint}
              onSubmit={handleSubmitAnswer}
            />
          )}
        </AnimatePresence>
      </main>

      <div className="bg-white border-t border-slate-200 p-4 text-center text-xs text-slate-400 font-medium tracking-widest uppercase">
        Safe Session Active • Do not refresh the page
      </div>
    </div>
  );
};
