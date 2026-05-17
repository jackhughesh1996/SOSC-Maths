import { processForMathJs, evaluateSafely, parseMathExpression } from "../../core/math";
import { checkEquivalence } from "./equivalence";
import { GradingRule } from "../schema/DynamicTestTypes";

export interface GradeAnswerInput {
  studentInput: string;
  correctAnswer: string | string[] | number | number[];
  rule: GradingRule;
  variables?: Record<string, number>;
}

export interface GradeAnswerResult {
  isCorrect: boolean;
  score: number;
  confidence: "high" | "medium" | "low";
  method: string;
  normalizedStudent: string;
  normalizedCorrect: string;
  diagnostics: string[];
}

/**
 * Main entrance for grading a student's answer against a correct reference.
 * It uses the provided grading rule to determine the comparison logic.
 */
export function gradeAnswer(input: GradeAnswerInput): GradeAnswerResult {
  const { studentInput, correctAnswer, rule, variables = {} } = input;
  const normStudent = processForMathJs(studentInput);
  
  // Default failure state
  const fail = (diag: string): GradeAnswerResult => ({
    isCorrect: false,
    score: rule.marks.incorrect,
    confidence: "high",
    method: rule.mode,
    normalizedStudent: normStudent,
    normalizedCorrect: String(correctAnswer),
    diagnostics: [diag]
  });

  // 1. Multiple Choice
  if (rule.mode === "multipleChoice") {
    const isCorrect = Array.isArray(correctAnswer) 
      ? correctAnswer.some(c => String(c) === studentInput)
      : String(correctAnswer) === studentInput;
    
    return {
      isCorrect,
      score: isCorrect ? rule.marks.correct : rule.marks.incorrect,
      confidence: "high",
      method: "multipleChoice",
      normalizedStudent: studentInput,
      normalizedCorrect: String(correctAnswer),
      diagnostics: []
    };
  }

  // 2. Manual Review
  if (rule.mode === "manualReview") {
    return {
      isCorrect: false,
      score: rule.marks.manualReview ?? 0,
      confidence: "high",
      method: "manualReview",
      normalizedStudent: studentInput,
      normalizedCorrect: String(correctAnswer),
      diagnostics: ["Pending manual review."]
    };
  }

  // 3. Numeric Grading
  if (rule.mode === "numericExact" || rule.mode === "numericTolerance") {
    const normCorrect = processForMathJs(String(Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer));
    const studentNode = parseMathExpression(normStudent);
    const correctNode = parseMathExpression(normCorrect);

    const sVal = evaluateSafely(studentNode, variables);
    const cVal = evaluateSafely(correctNode, variables);

    if (isNaN(sVal)) return fail("Student input did not evaluate to a valid number.");
    if (isNaN(cVal)) return fail("Correct answer reference is invalid.");

    const diff = Math.abs(sVal - cVal);
    const absTol = rule.tolerance?.absolute ?? 0;
    const relTol = rule.tolerance?.relative ?? 0;
    const allowed = Math.max(absTol, Math.abs(cVal) * relTol) || (rule.mode === "numericExact" ? 0 : 1e-8);

    const isCorrect = diff <= allowed;
    return {
      isCorrect,
      score: isCorrect ? rule.marks.correct : rule.marks.incorrect,
      confidence: "high",
      method: rule.mode,
      normalizedStudent: normStudent,
      normalizedCorrect: normCorrect,
      diagnostics: [`diff=${diff}`, `allowed=${allowed}`]
    };
  }

  // 4. Symbolic Grading (Simplify or Sampled)
  const refCorrect = String(Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer);
  const eqResult = checkEquivalence(studentInput, refCorrect, {
    tolerance: rule.tolerance?.absolute,
    variables: Object.keys(variables).length > 0 ? Object.keys(variables) : undefined
  });

  // Map result
  const isCorrect = eqResult.isEquivalent;
  return {
    isCorrect,
    score: isCorrect ? rule.marks.correct : rule.marks.incorrect,
    confidence: eqResult.confidence,
    method: eqResult.method,
    normalizedStudent: normStudent,
    normalizedCorrect: processForMathJs(refCorrect),
    diagnostics: eqResult.diagnostics
  };
}
