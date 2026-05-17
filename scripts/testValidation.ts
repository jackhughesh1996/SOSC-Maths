import { validateDynamicTestManifest } from '../src/assessment/schema/DynamicTestTypes';

const BROKEN_MANIFESTS = [
  {
    title: "Missing fields",
    manifest: { schemaVersion: "mathgraph-test-v1", testId: "t1" }
  },
  {
    title: "Duplicate IDs",
    manifest: {
      schemaVersion: "mathgraph-test-v1",
      testId: "t1",
      title: "Test",
      engine: { mathUtilsVersion: "1", gradingVersion: "1" },
      delivery: { durationSeconds: 60 },
      questions: [
        { id: "q1", type: "mathInput", answer: { correct: "1" }, grading: { mode: "numericExact" } },
        { id: "q1", type: "mathInput", answer: { correct: "2" }, grading: { mode: "numericExact" } }
      ],
      flow: { entryQuestionIds: ["q1"], navigation: "linear" }
    }
  },
  {
    title: "Circular Variables",
    manifest: {
      schemaVersion: "mathgraph-test-v1",
      testId: "t1",
      title: "Test",
      engine: { mathUtilsVersion: "1", gradingVersion: "1" },
      delivery: { durationSeconds: 60 },
      randomization: {
        variables: {
          "a": { type: "derived", expression: "b + 1" },
          "b": { type: "derived", expression: "a + 1" }
        }
      },
      questions: [{ id: "q1", type: "mathInput", answer: { correct: "1" }, grading: { mode: "numericExact" } }],
      flow: { entryQuestionIds: ["q1"] }
    }
  }
];

function runTests() {
  console.log("=== Manifest Validation Test Harness ===\n");

  BROKEN_MANIFESTS.forEach(test => {
    console.log(`Test: ${test.title}`);
    const result = validateDynamicTestManifest(test.manifest);
    console.log(`Status: ${result.isValid ? "PASS (Unexpected)" : "FAIL (Expected)"}`);
    console.log(`Messages: ${result.messages.length}`);
    result.messages.forEach(m => {
      console.log(`  [${m.type.toUpperCase()}] ${m.message} (${m.path || 'no path'})`);
    });
    console.log("-----------------------------------\n");
  });
}

runTests();
