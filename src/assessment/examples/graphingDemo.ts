import { DynamicTestManifest } from '../schema/DynamicTestTypes';

export const GRAPHING_DEMO: DynamicTestManifest = {
  schemaVersion: "mathgraph-test-v1",
  testId: "demo-linear-graphing",
  title: "Graphing: Gradient and Intercepts",
  description: "Identify key features of linear functions from their symbolic form.",
  engine: {
    mathUtilsVersion: "2026-05-16",
    gradingVersion: "v1"
  },
  delivery: {
    mode: "standalone",
    durationSeconds: 1200,
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
    maxHiddenEventsBeforeFlag: 3,
    shuffleQuestionOrder: true
  },
  randomization: {
    seedPolicy: "perStudent",
    variables: {
      "m": { "type": "integer", "min": -5, "max": 5 },
      "c": { "type": "integer", "min": -10, "max": 10 }
    }
  },
  rubric: {
    skills: [
      { "id": "GRAPH-GRAD", "name": "Gradient Identification", "description": "Identify 'm' in y = mx + c." },
      { "id": "GRAPH-YINT", "name": "Y-Intercept Identification", "description": "Identify 'c' in y = mx + c." }
    ],
    masteryBands: [
      { "id": "beg", "minPercent": 0, "label": "Beginning" },
      { "id": "adv", "minPercent": 80, "label": "Advanced" }
    ]
  },
  questions: [
    {
      "id": "g1",
      "type": "mathInput",
      "prompt": {
        "markdown": "In the equation $y = {{m}}x + {{c}}$, what is the **slope** (gradient)?",
        "latex": "y = {{m}}x + {{c}}"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "{{m}}" },
      "grading": {
        "mode": "numericExact",
        "marks": { "correct": 1, "assistedCorrect": 0, "incorrect": 0 },
        "feedback": { "correct": "Correct!", "incorrect": "Identify the coefficient of x." }
      },
      "hints": [
        { "level": 1, "kind": "conceptual", "content": { "markdown": "The slope is the coefficient of the $x$ term." } }
      ],
      "rubric": { "skillId": "GRAPH-GRAD", "level": 1, "maxMarks": 1 }
    },
    {
      "id": "g2",
      "type": "mathInput",
      "prompt": {
        "markdown": "What is the **y-intercept** of the line $y = {{m}}x + {{c}}$?",
        "latex": "y = {{m}}x + {{c}}"
      },
      "display": { "answerField": "mathlive" },
      "answer": { "format": "number", "correct": "{{c}}" },
      "grading": {
        "mode": "numericExact",
        "marks": { "correct": 1, "assistedCorrect": 0, "incorrect": 0 },
        "feedback": { "correct": "Correct!", "incorrect": "Identify the constant term." }
      },
      "hints": [
        { "level": 1, "kind": "conceptual", "content": { "markdown": "The y-intercept is the constant term where $x = 0$." } }
      ],
      "rubric": { "skillId": "GRAPH-YINT", "level": 1, "maxMarks": 1 }
    },
    {
      "id": "g3",
      "type": "multipleChoice",
      "prompt": {
        "markdown": "If the slope is ${{m}}$ and the y-intercept is ${{c}}$, which equation is correct?"
      },
      "metadata": {
        "choices": [
          "y = {{m}}x + {{c}}",
          "y = {{c}}x + {{m}}",
          "y = {{m}} + x",
          "y = x + {{c}}"
        ]
      },
      "display": { "answerField": "choice" },
      "answer": { "format": "choice", "correct": "y = {{m}}x + {{c}}" },
      "grading": {
        "mode": "multipleChoice",
        "marks": { "correct": 1, "assistedCorrect": 1, "incorrect": 0 },
        "feedback": { "correct": "That's the standard y = mx + c form.", "incorrect": "Check which variable represents slope and which represents intercept." }
      },
      "hints": [],
      "rubric": { "skillId": "GRAPH-GRAD", "level": 2, "maxMarks": 1 }
    }
  ],
  "flow": {
    "entryQuestionIds": ["g1", "g2", "g3"],
    "navigation": "linear",
    "allowBacktracking": true
  },
  "reporting": {
    "includeRubricAlignment": true,
    "includeHintUsage": true,
    "includeTabTracking": true,
    "includeQuestionTranscript": true
  }
};
