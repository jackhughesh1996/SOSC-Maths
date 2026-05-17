import { 
  DynamicTestManifest, 
  DynamicQuestion, 
  MonitoringSnapshot,
  QuestionResponse, 
  ResolvedVariables,
  StudentIdentity,
  SubmitReason,
  TestSubmission 
} from "../schema/DynamicTestTypes";
import { resolveRandomVariables, interpolateTemplate } from "../runtime/randomization";
import { gradeAnswer } from "../grading/assessmentGrader";
import { HintController } from "./HintController";
import { AdaptiveFlow } from "./AdaptiveFlow";
import { SubmissionBuilder } from "./SubmissionBuilder";

export interface AttemptState {
  attemptId: string;
  seed: string;
  student: StudentIdentity;
  resolvedVariables: ResolvedVariables;
  currentQuestionId: string | null;
  visitedQuestionIds: string[];
  responses: Record<string, QuestionResponse>;
  hintState: Record<string, number[]>; // questionId -> revealedLevels
  isAssisted: Record<string, boolean>; // questionId -> boolean
  startedAt: string;
  submittedAt: string | null;
  status: "active" | "submitted";
}

export class TestRuntime {
  /**
   * Initializes a new test attempt.
   */
  static initialiseAttempt(
    manifest: DynamicTestManifest,
    student: StudentIdentity,
    seed?: string
  ): AttemptState {
    const finalSeed = seed || Math.random().toString(36).substring(7);
    const resolvedVariables = resolveRandomVariables(
      manifest.randomization.variables,
      finalSeed
    );

    const firstQuestionId = manifest.flow.entryQuestionIds[0] || manifest.questions[0]?.id || null;

    return {
      attemptId: Math.random().toString(36).substring(2, 11),
      seed: finalSeed,
      student,
      resolvedVariables,
      currentQuestionId: firstQuestionId,
      visitedQuestionIds: firstQuestionId ? [firstQuestionId] : [],
      responses: {},
      hintState: {},
      isAssisted: {},
      startedAt: new Date().toISOString(),
      submittedAt: null,
      status: "active"
    };
  }

  /**
   * Gets the current question with its content interpolated.
   */
  static getCurrentQuestion(state: AttemptState, manifest: DynamicTestManifest): DynamicQuestion | null {
    if (!state.currentQuestionId) return null;
    const question = manifest.questions.find(q => q.id === state.currentQuestionId);
    if (!question) return null;

    // Interpolate question content with resolved variables
    return {
      ...question,
      prompt: {
        ...question.prompt,
        markdown: interpolateTemplate(question.prompt.markdown, state.resolvedVariables),
        latex: question.prompt.latex ? interpolateTemplate(question.prompt.latex, state.resolvedVariables) : undefined
      }
    };
  }

  /**
   * Reveals a hint for the current question.
   */
  static revealHint(state: AttemptState, questionId: string, level: number, manifest: DynamicTestManifest): AttemptState {
    const question = manifest.questions.find(q => q.id === questionId);
    if (!question) return state;

    const currentHints = state.hintState[questionId] || [];
    if (currentHints.includes(level)) return state;

    const hint = HintController.getHintByLevel(question, level);
    if (!hint) return state;

    const isAssistedNow = state.isAssisted[questionId] || HintController.shouldMarkAsAssisted(hint);

    return {
      ...state,
      hintState: {
        ...state.hintState,
        [questionId]: [...currentHints, level]
      },
      isAssisted: {
        ...state.isAssisted,
        [questionId]: isAssistedNow
      }
    };
  }

  /**
   * Grades and saves an answer.
   */
  static submitAnswer(
    state: AttemptState,
    questionId: string,
    studentInput: { latex: string; evalText: string },
    manifest: DynamicTestManifest
  ): { state: AttemptState; result: QuestionResponse } {
    const question = manifest.questions.find(q => q.id === questionId)!;
    
    // Interpolate correct answer if it's a template
    const rawCorrect = question.answer.correct;
    const correctVal = typeof rawCorrect === "string" 
      ? interpolateTemplate(rawCorrect, state.resolvedVariables)
      : rawCorrect;

    const gradingResult = gradeAnswer({
      studentInput: studentInput.evalText,
      correctAnswer: correctVal,
      rule: question.grading,
      variables: numericVariablesOnly(state.resolvedVariables)
    });

    const assisted = !!state.isAssisted[questionId];
    const marksAwarded = gradingResult.isCorrect 
      ? (assisted ? question.grading.marks.assistedCorrect : question.grading.marks.correct)
      : question.grading.marks.incorrect;

    const response: QuestionResponse = {
      questionId,
      promptRendered: interpolateTemplate(question.prompt.markdown, state.resolvedVariables),
      studentLatex: studentInput.latex,
      studentEvalText: studentInput.evalText,
      correctEvalText: String(correctVal),
      isCorrect: gradingResult.isCorrect,
      assisted,
      hintsUsed: state.hintState[questionId] || [],
      marksAwarded,
      maxMarks: question.rubric.maxMarks,
      gradingMethod: gradingResult.method,
      diagnostics: gradingResult.diagnostics,
      answeredAt: new Date().toISOString()
    };

    const nextState: AttemptState = {
      ...state,
      responses: {
        ...state.responses,
        [questionId]: response
      }
    };

    return { state: nextState, result: response };
  }

  /**
   * Advances to the next question.
   */
  static advance(
    state: AttemptState,
    manifest: DynamicTestManifest,
    lastResponse: QuestionResponse
  ): AttemptState {
    const nextId = AdaptiveFlow.resolveNextQuestion(manifest, lastResponse.questionId, lastResponse);

    if (!nextId) {
      return { ...state, currentQuestionId: null };
    }

    return {
      ...state,
      currentQuestionId: nextId,
      visitedQuestionIds: [...state.visitedQuestionIds, nextId]
    };
  }

  /**
   * Finishes the test.
   */
  static finalize(
    state: AttemptState,
    manifest: DynamicTestManifest,
    reason: SubmitReason,
    monitoring: MonitoringSnapshot
  ): TestSubmission {
    const submittedAt = new Date().toISOString();
    const durationSeconds = Math.floor((new Date(submittedAt).getTime() - new Date(state.startedAt).getTime()) / 1000);

    return SubmissionBuilder.buildSubmission({
      manifest,
      student: state.student,
      attempt: {
        attemptId: state.attemptId,
        seed: state.seed,
        startedAt: state.startedAt,
        submittedAt,
        submitReason: reason,
        durationSeconds
      },
      resolvedVariables: state.resolvedVariables,
      responses: Object.values(state.responses),
      monitoring
    });
  }
}

const numericVariablesOnly = (variables: ResolvedVariables): Record<string, number> =>
  Object.fromEntries(
    Object.entries(variables).filter((entry): entry is [string, number] => typeof entry[1] === 'number')
  );
