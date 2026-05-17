import { DynamicTestManifest } from '../schema/DynamicTestTypes';

export const NUMERACY_DEMO: DynamicTestManifest = {
  schemaVersion: "mathgraph-test-v1",
  testId: "demo-numeracy",
  title: "Numeracy: Precision and Fractions",
  description: "Test numerical evaluation with tolerances and decimal/fraction conversions.",
  engine: {
    mathUtilsVersion: "2026-05-16",
    gradingVersion: "v1"
  },
  delivery: {
    mode: "standalone",
    durationSeconds: 600,
    autoSubmitOnExpiry: true,
    allowPause: true,
    requireStudentName: true,
    startMode: "studentManual"
  },
  security: {
    trackTabVisibility: false,
    trackFocusBlur: false,
    warnOnHidden: false,
    shuffleQuestionOrder: false
  },
  randomization: {
    seedPolicy: "perStudent",
    variables: {
      "numerator": { "type": "integer", "min": 1, "max": 9 },
      "denominator": { "type": "integer", "min": 11, "max": 20 },
      "ratio": { "type": "derived", "expression": "numerator / denominator" }
    }
  },
  rubric: {
    skills: [
      { "id": "NUM-DEC", "name": "Decimal Conversion", "description": "Convert fractions to decimals with precision." },
      { "id": "NUM-EST", "name": "Estimation", "description": "Provide answers within a specified range." }
    ],
    masteryBands: [
      { "id": "standard", "minPercent": 0, "label": "Standard" }
    ]
  },
  questions: [
    {
      "id": "n1",
      "type": "mathInput",
      "prompt": {
        "markdown": "Convert $\\frac{ {{numerator}} }{ {{denominator}} }$ to a decimal. Round to 3 decimal places.",
        "latex": "\\frac{ {{numerator}} }{ {{denominator}} }"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "{{ratio}}" },
      "grading": {
        "mode": "numericTolerance",
        "tolerance": { "absolute": 0.001 },
        "marks": { "correct": 1, "assistedCorrect": 0.5, "incorrect": 0 },
        "feedback": { "correct": "Correct precision!", "incorrect": "Check your division or rounding." }
      },
      "hints": [
        { "level": 1, "kind": "method", "content": { "markdown": "Divide {{numerator}} by {{denominator}} using a calculator or long division." } }
      ],
      "rubric": { "skillId": "NUM-DEC", "level": 1, "maxMarks": 1 }
    },
    {
      "id": "n2",
      "type": "mathInput",
      "prompt": {
        "markdown": "What is the value of $\\pi$ rounded to 2 decimal places?"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "3.14" },
      "grading": {
        "mode": "numericTolerance",
        "tolerance": { "absolute": 0.01 },
        "marks": { "correct": 1, "assistedCorrect": 0, "incorrect": 0 },
        "feedback": { "correct": "Exactly, 3.14 is the standard rounding.", "incorrect": "Try 3.14." }
      },
      "hints": [
        { "level": 1, "kind": "conceptual", "content": { "markdown": "Think of the first three digits of Pi: 3.1..." } }
      ],
      "rubric": { "skillId": "NUM-EST", "level": 1, "maxMarks": 1 }
    }
  ],
  "flow": {
    "entryQuestionIds": ["n1", "n2"],
    "navigation": "linear",
    "allowBacktracking": true
  },
  "reporting": {
    "includeRubricAlignment": true,
    "includeHintUsage": true,
    "includeTabTracking": false,
    "includeQuestionTranscript": true
  }
};
