import { DynamicTestManifest } from "./schema/DynamicTestTypes";

export const DEMO_MANIFEST: DynamicTestManifest = {
  schemaVersion: "mathgraph-test-v1",
  testId: "algebra-foundations-v1",
  title: "Algebra Foundations: Linear Equations",
  description: "A check for understanding covering one and two-step linear equations, including randomized variables.",
  
  engine: {
    mathUtilsVersion: "2026-05-16",
    gradingVersion: "v1"
  },

  delivery: {
    mode: "standalone",
    durationSeconds: 1200, // 20 mins
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
    shuffleQuestionOrder: false
  },

  randomization: {
    seedPolicy: "perStudent",
    variables: {
      "a": { type: "integer", min: 2, max: 8 },
      "b": { type: "integer", min: 1, max: 12 },
      "val": { type: "derived", expression: "a * b" }
    }
  },

  rubric: {
    skills: [
      { id: "ALG-SOLVE-1", name: "Solving One-Step Equations", description: "Solve simple x + a = b equations." },
      { id: "ALG-SOLVE-2", name: "Solving Two-Step Equations", description: "Solve ax + b = c equations." }
    ],
    masteryBands: [
      { id: "em", minPercent: 0, label: "Emerging" },
      { id: "dev", minPercent: 50, label: "Developing" },
      { id: "sec", minPercent: 75, label: "Secure" },
      { id: "adv", minPercent: 90, label: "Advanced" }
    ]
  },

  questions: [
    {
      id: "q1",
      type: "mathInput",
      prompt: {
        markdown: "Solve for $x$: $x + {{a}} = {{a + b}}$",
        latex: "x + {{a}} = {{a + b}}"
      },
      display: {
        answerField: "mathlive"
      },
      answer: {
        format: "number",
        correct: "{{b}}"
      },
      grading: {
        mode: "numericTolerance",
        marks: { correct: 1, assistedCorrect: 0.5, incorrect: 0 },
        feedback: { correct: "Great job!", incorrect: "Try again. Remember to subtract {{a}} from both sides." }
      },
      hints: [
        {
          level: 1,
          kind: "conceptual",
          content: { markdown: "To isolate $x$, you need to perform the inverse operation of adding {{a}}." }
        },
        {
          level: 2,
          kind: "method",
          content: { markdown: "Subtract {{a}} from both sides of the equation." }
        },
        {
          level: 3,
          kind: "answerReveal",
          content: { markdown: "The answer is $x = {{b}}$." },
          penalty: { markAsAssisted: true }
        }
      ],
      rubric: {
        skillId: "ALG-SOLVE-1",
        level: 1,
        maxMarks: 1
      },
      adaptive: {
        onCorrect: "q2",
        onIncorrect: "q1_prereq"
      }
    },
    {
      id: "q1_prereq",
      type: "multipleChoice",
      prompt: {
        markdown: "What is the inverse operation of adding 5?"
      },
      metadata: {
        choices: ["Subtracting 5", "Adding -5", "Multiplying by 5", "Dividing by 5"]
      },
      display: {
        answerField: "choice"
      },
      answer: {
        format: "choice",
        correct: "Subtracting 5"
      },
      grading: {
        mode: "multipleChoice",
        marks: { correct: 1, assistedCorrect: 1, incorrect: 0 },
        feedback: { correct: "Exactly.", incorrect: "Not quite." }
      },
      hints: [],
      rubric: {
        skillId: "ALG-SOLVE-1",
        level: 1,
        maxMarks: 1
      },
      adaptive: {
        onCorrect: "q2",
        onIncorrect: "q2" // Fallback to linear if they keep failing prereq
      }
    },
    {
      id: "q2",
      type: "mathInput",
      prompt: {
        markdown: "Solve for $x$: ${{a}}x = {{val}}$",
        latex: "{{a}}x = {{val}}"
      },
      display: {
        answerField: "mathlive"
      },
      answer: {
        format: "number",
        correct: "{{b}}"
      },
      grading: {
        mode: "numericTolerance",
        marks: { correct: 1, assistedCorrect: 0.5, incorrect: 0 },
        feedback: { correct: "Correct!", incorrect: "Think about how to undo multiplication." }
      },
      hints: [
        {
          level: 1,
          kind: "method",
          content: { markdown: "Divide both sides by {{a}} to solve for $x$." }
        }
      ],
      rubric: {
        skillId: "ALG-SOLVE-1",
        level: 2,
        maxMarks: 1
      }
    }
  ],

  flow: {
    entryQuestionIds: ["q1"],
    navigation: "adaptive",
    allowBacktracking: false
  },

  reporting: {
    includeRubricAlignment: true,
    includeHintUsage: true,
    includeTabTracking: true,
    includeQuestionTranscript: true
  }
};
