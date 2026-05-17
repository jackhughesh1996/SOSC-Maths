/**
 * SOSC Maths: Assessment System Types
 * 
 * This file defines the core data structures for the dynamic test manifest,
 * student submissions, and rubric tracking.
 */

export interface DynamicTestManifest {
  schemaVersion: "mathgraph-test-v1";
  testId: string;
  title: string;
  description?: string;

  engine: {
    mathUtilsVersion: string;
    gradingVersion: string;
    mathLiveVersion?: string;
    mathJsVersion?: string;
  };

  delivery: {
    mode: "standalone" | "synced";
    durationSeconds: number;
    autoSubmitOnExpiry: boolean;
    allowPause: boolean;
    requireStudentName: boolean;
    requireStudentId?: boolean;
    startMode: "studentManual" | "fixedTime" | "teacherStart";
    fixedStartIso?: string;
  };

  security: {
    trackTabVisibility: boolean;
    trackFocusBlur: boolean;
    warnOnHidden: boolean;
    maxHiddenSecondsBeforeFlag?: number;
    maxHiddenEventsBeforeFlag?: number;
    blockCopyPaste?: boolean;
    shuffleQuestionOrder?: boolean;
    shuffleOptionOrder?: boolean;
  };

  randomization: {
    seedPolicy: "perStudent" | "fixed";
    fixedSeed?: string;
    variables: Record<string, RandomVariableDefinition>;
  };

  rubric: {
    skills: RubricSkill[];
    masteryBands: MasteryBand[];
  };

  questions: DynamicQuestion[];

  flow: {
    entryQuestionIds: string[];
    navigation: "linear" | "adaptive";
    allowBacktracking: boolean;
    defaultNext?: string;
  };

  reporting: {
    includeRubricAlignment: boolean;
    includeHintUsage: boolean;
    includeTabTracking: boolean;
    includeQuestionTranscript: boolean;
  };
}

export type ResolvedVariableValue = number | string | boolean;

export type ResolvedVariables = Record<string, ResolvedVariableValue>;

export interface StudentIdentity {
  name: string;
  studentId?: string;
}

export type SubmitReason = "studentSubmit" | "timerExpired" | "teacherClosed";

export type RandomVariableDefinition =
  | RandomIntegerVariable
  | RandomDecimalVariable
  | RandomChoiceVariable
  | RandomDerivedVariable;

export interface RandomIntegerVariable {
  type: "integer";
  min: number;
  max: number;
  exclude?: number[];
}

export interface RandomDecimalVariable {
  type: "decimal";
  min: number;
  max: number;
  step?: number;
  decimals?: number;
}

export interface RandomChoiceVariable {
  type: "choice";
  values: Array<string | number | boolean>;
}

export interface RandomDerivedVariable {
  type: "derived";
  expression: string;
}

export interface RubricSkill {
  id: string;
  name: string;
  strand?: string;
  description?: string;
}

export interface MasteryBand {
  id: string;
  minPercent: number;
  label: string;
}

export interface DynamicQuestion {
  id: string;
  type:
    | "mathInput"
    | "multipleChoice"
    | "shortText"
    | "graphInteraction"
    | "multiPart";

  title?: string;

  prompt: {
    markdown: string;
    latex?: string;
    renderedText?: string;
  };

  variables?: Record<string, RandomVariableDefinition>;

  display: {
    showCalculator?: boolean;
    showGraph?: boolean;
    answerField: "mathlive" | "text" | "choice" | "graph";
  };

  answer: AnswerDefinition;
  grading: GradingRule;
  hints: ProgressiveHint[];

  rubric: {
    skillId: string;
    level: 1 | 2 | 3 | 4 | 5;
    descriptors?: string[];
    maxMarks: number;
  };

  adaptive?: {
    onCorrect?: string;
    onIncorrect?: string;
    onAssistedCorrect?: string;
    prerequisiteQuestionId?: string;
    extensionQuestionId?: string;
  };

  metadata?: {
    topic?: string;
    textbookReference?: string;
    estimatedSeconds?: number;
    difficulty?: "easy" | "medium" | "hard";
    choices?: Array<string | number>;
    [key: string]: unknown;
  };
}

export interface AnswerDefinition {
  format:
    | "expression"
    | "equation"
    | "number"
    | "choice"
    | "orderedPair"
    | "set"
    | "interval"
    | "text";

  correct: string | string[] | number | number[];
  acceptedForms?: string[];
  variables?: string[];
  requireSimplified?: boolean;
  requireExact?: boolean;
  unit?: string;
}

export interface GradingRule {
  mode:
    | "numericExact"
    | "numericTolerance"
    | "symbolicSimplify"
    | "symbolicSampled"
    | "multipleChoice"
    | "manualReview";

  tolerance?: {
    absolute?: number;
    relative?: number;
    decimalPlaces?: number;
  };

  sampling?: {
    variables: string[];
    samplesPerVariable: number;
    domain: Record<string, [number, number]>;
    avoid?: string[];
  };

  marks: {
    correct: number;
    assistedCorrect: number;
    incorrect: number;
    manualReview?: number;
  };

  feedback: {
    correct: string;
    incorrect: string;
    assisted?: string;
  };
}

export interface ProgressiveHint {
  level: 1 | 2 | 3;
  kind: "conceptual" | "method" | "workedStep" | "answerReveal";
  content: {
    markdown: string;
    latex?: string;
  };
  penalty?: {
    marksLost?: number;
    markAsAssisted?: boolean;
  };
}

/**
 * Result data types (Submission)
 */

export interface TestSubmission {
  schemaVersion: "mathgraph-submission-v1";
  testId: string;
  manifestHash: string;

  student: {
    name: string;
    studentId?: string;
  };

  attempt: {
    attemptId: string;
    seed: string;
    startedAt: string;
    submittedAt: string;
    submitReason: SubmitReason;
    durationSeconds: number;
  };

  resolvedVariables: ResolvedVariables;
  responses: QuestionResponse[];

  score: {
    rawMarks: number;
    maxMarks: number;
    percent: number;
    assistedQuestions: number;
  };

  rubrics: RubricReport[];

  monitoring: {
    tabTracking: TabTrackingSummary;
    events: VisibilityEvent[];
  };
}

export interface MonitoringSnapshot {
  tabTracking: TabTrackingSummary;
  events: VisibilityEvent[];
}

export interface QuestionResponse {
  questionId: string;
  promptRendered: string;
  studentLatex?: string;
  studentEvalText?: string;
  correctEvalText?: string;
  isCorrect: boolean;
  assisted: boolean;
  hintsUsed: number[];
  marksAwarded: number;
  maxMarks: number;
  gradingMethod: string;
  diagnostics: string[];
  answeredAt: string;
}

export interface RubricReport {
  skillId: string;
  skillName: string;
  marksAwarded: number;
  maxMarks: number;
  percent: number;
  masteryBand: string;
  assistedCorrectCount: number;
  incorrectCount: number;
}

export interface TabTrackingSummary {
  hiddenEventCount: number;
  totalHiddenSeconds: number;
  longestHiddenSeconds: number;
  focusLostCount: number;
  flags: string[];
}

export interface VisibilityEvent {
  type: "visibilitychange" | "blur" | "focus";
  state: "visible" | "hidden" | "focused" | "blurred";
  timestamp: number;
  elapsedSeconds: number;
}

/**
 * Validation
 */

export interface ValidationMessage {
  type: "error" | "warning" | "info";
  message: string;
  path?: string;
}

export interface ValidationResult {
  isValid: boolean;
  messages: ValidationMessage[];
  errors: string[]; // For backward compatibility
}

type UnknownRecord = Record<string, unknown>;

interface ValidationSkillCandidate extends UnknownRecord {
  id?: unknown;
}

interface ValidationHintCandidate extends UnknownRecord {
  level?: unknown;
  kind?: unknown;
  penalty?: { markAsAssisted?: unknown };
}

interface ValidationQuestionCandidate extends UnknownRecord {
  id?: unknown;
  type?: unknown;
  answer?: {
    correct?: unknown;
    format?: unknown;
  };
  grading?: {
    mode?: unknown;
  };
  rubric?: {
    skillId?: unknown;
  };
  hints?: ValidationHintCandidate[];
  variables?: Record<string, RandomVariableDefinition>;
  adaptive?: Record<string, unknown>;
}

interface ValidationManifestCandidate extends UnknownRecord {
  schemaVersion?: unknown;
  testId?: unknown;
  title?: unknown;
  engine?: {
    mathUtilsVersion?: unknown;
    gradingVersion?: unknown;
  };
  delivery?: {
    durationSeconds?: unknown;
  };
  rubric?: {
    skills?: ValidationSkillCandidate[];
    masteryBands?: MasteryBand[];
  };
  randomization?: {
    variables?: Record<string, RandomVariableDefinition>;
  };
  questions?: ValidationQuestionCandidate[];
  flow?: {
    entryQuestionIds?: string[];
    defaultNext?: string;
  };
}

export function validateDynamicTestManifest(manifest: unknown): ValidationResult {
  const messages: ValidationMessage[] = [];
  
  if (!manifest || typeof manifest !== "object") {
    return { 
      isValid: false, 
      messages: [{ type: "error", message: "Manifest is not an object" }],
      errors: ["Manifest is not an object"]
    };
  }

  const m = manifest as ValidationManifestCandidate;

  // 1. Core Metadata
  if (m.schemaVersion !== "mathgraph-test-v1") {
    messages.push({ type: "error", message: "Missing or invalid schemaVersion. Expected 'mathgraph-test-v1'.", path: "schemaVersion" });
  }

  if (!m.testId) messages.push({ type: "error", message: "Missing testId", path: "testId" });
  if (!m.title) messages.push({ type: "error", message: "Missing title", path: "title" });

  // 2. Engine
  if (!m.engine) {
    messages.push({ type: "error", message: "Missing engine configuration", path: "engine" });
  } else {
    if (!m.engine.mathUtilsVersion) messages.push({ type: "error", message: "Missing mathUtilsVersion", path: "engine.mathUtilsVersion" });
    if (!m.engine.gradingVersion) messages.push({ type: "error", message: "Missing gradingVersion", path: "engine.gradingVersion" });
  }

  // 3. Delivery
  if (!m.delivery) {
    messages.push({ type: "error", message: "Missing delivery configuration", path: "delivery" });
  } else {
    if (typeof m.delivery.durationSeconds !== "number") {
      messages.push({ type: "error", message: "durationSeconds must be a number", path: "delivery.durationSeconds" });
    } else if (m.delivery.durationSeconds <= 0) {
      messages.push({ type: "error", message: "durationSeconds must be greater than 0", path: "delivery.durationSeconds" });
    }
  }

  // 4. Rubric & Skills
  const skillIds = new Set<string>();
  if (m.rubric?.skills && Array.isArray(m.rubric.skills)) {
    m.rubric.skills.forEach((s, i: number) => {
      if (!s.id) {
        messages.push({ type: "error", message: `Skill at index ${i} is missing an ID`, path: `rubric.skills[${i}]` });
      } else {
        const skillId = String(s.id);
        if (skillIds.has(skillId)) {
          messages.push({ type: "error", message: `Duplicate skill ID: ${s.id}`, path: `rubric.skills[${i}].id` });
        }
        skillIds.add(skillId);
      }
    });
  }

  if (m.rubric?.masteryBands && Array.isArray(m.rubric.masteryBands)) {
    const bands = m.rubric.masteryBands as MasteryBand[];
    for (let i = 1; i < bands.length; i++) {
      if (bands[i].minPercent <= bands[i-1].minPercent) {
        messages.push({ 
          type: "warning", 
          message: `Mastery band "${bands[i].label}" has a threshold (${bands[i].minPercent}%) not strictly greater than "${bands[i-1].label}" (${bands[i-1].minPercent}%)`,
          path: `rubric.masteryBands[${i}]`
        });
      }
    }
  }

  // 5. Global Random Variables
  const globalVarNames = new Set<string>();
  if (m.randomization?.variables) {
    validateVariables(m.randomization.variables, "randomization.variables", globalVarNames, messages);
  }

  // 6. Questions
  const questionIds = new Set<string>();
  if (!Array.isArray(m.questions) || m.questions.length === 0) {
    messages.push({ type: "error", message: "Manifest must contain at least one question", path: "questions" });
  } else {
    m.questions.forEach((q, i: number) => {
      const qPath = `questions[${i}]`;
      if (!q.id) {
        messages.push({ type: "error", message: `Question at index ${i} is missing id`, path: qPath });
      } else {
        const questionId = String(q.id);
        if (questionIds.has(questionId)) {
          messages.push({ type: "error", message: `Duplicate question ID: ${q.id}`, path: `${qPath}.id` });
        }
        questionIds.add(questionId);
      }

      if (!q.type) messages.push({ type: "error", message: `Question ${q.id || i} is missing type`, path: `${qPath}.type` });
      
      // Answer & Grading Consistency
      if (!q.answer) {
        messages.push({ type: "error", message: `Question ${q.id || i} is missing answer definition`, path: `${qPath}.answer` });
      } else {
        if (q.answer.correct === undefined || q.answer.correct === null || q.answer.correct === "") {
          messages.push({ type: "error", message: `Question ${q.id || i} is missing a correct answer`, path: `${qPath}.answer.correct` });
        }
        
        if (q.grading) {
          const mode = q.grading.mode;
          const format = q.answer.format;
          
          if (mode === "numericExact" || mode === "numericTolerance") {
            if (format !== "number") {
              messages.push({ type: "warning", message: `Numeric grading mode used with non-number answer format (${format})`, path: `${qPath}.grading.mode` });
            }
          }
          if (mode === "multipleChoice" && format !== "choice") {
            messages.push({ type: "error", message: "multipleChoice grading mode requires choice answer format", path: `${qPath}.grading.mode` });
          }
        }
      }

      if (!q.grading) {
        messages.push({ type: "error", message: `Question ${q.id || i} is missing grading rule`, path: `${qPath}.grading` });
      }

      // Rubric alignment
      if (q.rubric) {
        if (!q.rubric.skillId) {
          messages.push({ type: "error", message: `Question ${q.id || i} is missing skillId alignment`, path: `${qPath}.rubric.skillId` });
        } else if (!skillIds.has(String(q.rubric.skillId))) {
          messages.push({ type: "error", message: `Question ${q.id || i} references ghost skillId: ${q.rubric.skillId}`, path: `${qPath}.rubric.skillId` });
        }
      }

      // Hints
      if (Array.isArray(q.hints)) {
        q.hints.forEach((h, hi: number) => {
          const hPath = `${qPath}.hints[${hi}]`;
          const hintLevel = Number(h.level);
          if (!Number.isInteger(hintLevel) || hintLevel < 1 || hintLevel > 3) {
            messages.push({ type: "error", message: `Hint level ${h.level} is invalid (must be 1-3)`, path: `${hPath}.level` });
          }
          if (h.kind === "answerReveal" && hintLevel === 3) {
            if (!h.penalty?.markAsAssisted) {
              messages.push({ type: "warning", message: "Level 3 Answer Reveal should typically carry an 'assisted' penalty", path: hPath });
            }
          }
        });
      }

      // Local Variables
      if (q.variables) {
        const localVarNames = new Set(globalVarNames);
        validateVariables(q.variables, `${qPath}.variables`, localVarNames, messages);
      }
    });
  }

  // 7. Flow & Adaptive logic
  if (!m.flow) {
    messages.push({ type: "error", message: "Missing flow configuration", path: "flow" });
  } else {
    if (!Array.isArray(m.flow.entryQuestionIds) || m.flow.entryQuestionIds.length === 0) {
      messages.push({ type: "error", message: "flow.entryQuestionIds must contain at least one ID", path: "flow.entryQuestionIds" });
    } else {
      m.flow.entryQuestionIds.forEach((id: string, i: number) => {
        if (!questionIds.has(id)) {
          messages.push({ type: "error", message: `Flow entry references missing question ID: ${id}`, path: `flow.entryQuestionIds[${i}]` });
        }
      });
    }

    // Question-level adaptive routes
    if (m.questions && Array.isArray(m.questions)) {
      m.questions.forEach((q) => {
        if (q.adaptive) {
          const routes = ['onCorrect', 'onIncorrect', 'onAssistedCorrect', 'prerequisiteQuestionId', 'extensionQuestionId'];
          routes.forEach(route => {
            const targetId = q.adaptive?.[route];
            const targetQuestionId = typeof targetId === 'string' ? targetId : null;
            if (targetQuestionId && !questionIds.has(targetQuestionId)) {
              messages.push({ type: "error", message: `Question ${q.id} adaptive route "${route}" points to missing ID: ${targetId}`, path: `questions.${q.id}.adaptive.${route}` });
            }
          });
        }
      });
    }
  }

  // 8. Size check
  const manifestSize = JSON.stringify(m).length;
  if (manifestSize > 500 * 1024) { // 500KB
    messages.push({ type: "warning", message: `Manifest size (${(manifestSize/1024).toFixed(1)}KB) is unusually large. This may impact standalone load times.`, path: "root" });
  }
  if (manifestSize > 2 * 1024 * 1024) { // 2MB
    messages.push({ type: "error", message: "Manifest exceeds 2MB limit. Please reduce embedded assets or question count.", path: "root" });
  }

  const errors = messages.filter(m => m.type === "error").map(m => m.message);

  return {
    isValid: errors.length === 0,
    messages,
    errors
  };
}

function validateVariables(variables: Record<string, RandomVariableDefinition>, basePath: string, existingNames: Set<string>, messages: ValidationMessage[]) {
  const varNames = Object.keys(variables);
  
  // 1. Name validity
  varNames.forEach(name => {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      messages.push({ type: "error", message: `Invalid variable name: "${name}". Must start with a letter and contain only alphanumeric chars/underscores.`, path: `${basePath}.${name}` });
    }
    if (existingNames.has(name)) {
      messages.push({ type: "error", message: `Duplicate variable name: "${name}"`, path: `${basePath}.${name}` });
    }
    existingNames.add(name);
  });

  // 2. Dependency checks for derived vars
  const dependencyGraph: Record<string, string[]> = {};
  varNames.forEach(name => {
    const v = variables[name];
    if (v.type === "derived" && v.expression) {
      // Very basic regex to find variable references in expression 
      // This is a naive check but useful for basic cycles
      const refs = v.expression.match(/[a-zA-Z][a-zA-Z0-9_]*/g) || [];
      dependencyGraph[name] = refs.filter(r => varNames.includes(r));
      
      // Check for unknown references within the same scope
      refs.forEach((ref: string) => {
        if (!existingNames.has(ref) && !varNames.includes(ref)) {
          messages.push({ type: "warning", message: `Derived variable "${name}" may reference unknown variable or function: "${ref}"`, path: `${basePath}.${name}.expression` });
        }
      });
    }
  });

  // 3. Circular Dependency Detection (DFS)
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(node: string): boolean {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = dependencyGraph[node] || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  varNames.forEach(name => {
    if (hasCycle(name)) {
      messages.push({ type: "error", message: `Circular dependency detected involving variable: "${name}"`, path: `${basePath}.${name}` });
    }
  });
}
