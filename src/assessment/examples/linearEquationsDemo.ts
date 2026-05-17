import { DynamicTestManifest } from '../schema/DynamicTestTypes';

export const LINEAR_EQUATIONS_DEMO: DynamicTestManifest = {
  schemaVersion: "mathgraph-test-v1",
  testId: "demo-linear-equations",
  title: "Linear Equations: One and Two Steps",
  description: "A mastery check for solving linear equations with integer solutions and adaptive intervention.",
  engine: {
    mathUtilsVersion: "2026-05-16",
    gradingVersion: "v1"
  },
  delivery: {
    mode: "standalone",
    durationSeconds: 900,
    autoSubmitOnExpiry: true,
    allowPause: true,
    requireStudentName: true,
    startMode: "studentManual"
  },
  security: {
    trackTabVisibility: true,
    trackFocusBlur: true,
    warnOnHidden: true,
    maxHiddenSecondsBeforeFlag: 60,
    maxHiddenEventsBeforeFlag: 5,
    shuffleQuestionOrder: false
  },
  randomization: {
    seedPolicy: "perStudent",
    variables: {
      "a": { "type": "integer", "min": 2, "max": 7 },
      "b": { "type": "integer", "min": 1, "max": 15 },
      "x_val": { "type": "integer", "min": 1, "max": 10 },
      "rhs_one": { "type": "derived", "expression": "x_val + b" },
      "rhs_two": { "type": "derived", "expression": "a * x_val + b" }
    }
  },
  rubric: {
    skills: [
      { "id": "SOLVE-1", "name": "Basic Isolation", "description": "Solves x + a = b by subtracting." },
      { "id": "SOLVE-2", "name": "Coefficient Reduction", "description": "Solves ax = b by dividing." },
      { "id": "SOLVE-MULTI", "name": "Multi-Step Strategy", "description": "Solves ax + b = c using BEDMAS inverse." }
    ],
    masteryBands: [
      { "id": "novice", "minPercent": 0, "label": "Novice" },
      { "id": "proficient", "minPercent": 70, "label": "Proficient" },
      { "id": "mastery", "minPercent": 90, "label": "Mastery" }
    ]
  },
  questions: [
    {
      "id": "q1",
      "type": "mathInput",
      "prompt": {
        "markdown": "Solve for $x$: $x + {{b}} = {{rhs_one}}$",
        "latex": "x + {{b}} = {{rhs_one}}"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "{{x_val}}" },
      "grading": {
        "mode": "numericExact",
        "marks": { "correct": 1, "assistedCorrect": 0.5, "incorrect": 0 },
        "feedback": { "correct": "Correct! You isolated x perfectly.", "incorrect": "Try again. Remember to subtract {{b}} from {{rhs_one}}." }
      },
      "hints": [
        { "level": 1, "kind": "conceptual", "content": { "markdown": "To find $x$, you need to remove the $+{{b}}$." } },
        { "level": 2, "kind": "method", "content": { "markdown": "Subtract {{b}} from both sides: $x = {{rhs_one}} - {{b}}$" } }
      ],
      "rubric": { "skillId": "SOLVE-1", "level": 1, "maxMarks": 1 },
      "adaptive": { "onIncorrect": "q1_help", "onCorrect": "q2" }
    },
    {
      "id": "q1_help",
      "type": "multipleChoice",
      "prompt": { "markdown": "If you have $x + 5 = 10$, what is the first step?" },
      "metadata": { "choices": ["Add 5 to both sides", "Subtract 5 from both sides", "Multiply by 5", "Divide by 10"] },
      "display": { "answerField": "choice" },
      "answer": { "format": "choice", "correct": "Subtract 5 from both sides" },
      "grading": {
        "mode": "multipleChoice",
        "marks": { "correct": 1, "assistedCorrect": 1, "incorrect": 0 },
        "feedback": { "correct": "Exactly.", "incorrect": "Not quite." }
      },
      "hints": [],
      "rubric": { "skillId": "SOLVE-1", "level": 1, "maxMarks": 1 },
      "adaptive": { "onCorrect": "q2", "onIncorrect": "q2" }
    },
    {
      "id": "q2",
      "type": "mathInput",
      "prompt": {
        "markdown": "Step up! Solve for $x$: ${{a}}x + {{b}} = {{rhs_two}}$",
        "latex": "{{a}}x + {{b}} = {{rhs_two}}"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "{{x_val}}" },
      "grading": {
        "mode": "numericExact",
        "marks": { "correct": 2, "assistedCorrect": 1, "incorrect": 0 },
        "feedback": { "correct": "Excellent work!", "incorrect": "Try to re-run your inverse operations." }
      },
      "hints": [
        { "level": 1, "kind": "method", "content": { "markdown": "First, subtract {{b}} from {{rhs_two}}." } },
        { "level": 2, "kind": "method", "content": { "markdown": "Then, divide the result by {{a}}." } },
        { "level": 3, "kind": "answerReveal", "content": { "markdown": "The solution is $x = {{x_val}}$." }, "penalty": { "markAsAssisted": true } }
      ],
      "rubric": { "skillId": "SOLVE-MULTI", "level": 2, "maxMarks": 2 }
    }
  ],
  "flow": {
    "entryQuestionIds": ["q1"],
    "navigation": "adaptive",
    "allowBacktracking": false
  },
  "reporting": {
    "includeRubricAlignment": true,
    "includeHintUsage": true,
    "includeTabTracking": true,
    "includeQuestionTranscript": true
  }
};
