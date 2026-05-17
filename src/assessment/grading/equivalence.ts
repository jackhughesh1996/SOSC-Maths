import { processForMathJs, evaluateSafely, parseMathExpression, simplifyMathExpression } from "../../core/math";

export interface EquivalenceResult {
  isEquivalent: boolean;
  method: string;
  confidence: "high" | "medium" | "low";
  diagnostics: string[];
}

/**
 * Tries to establish if two expressions are mathematically equivalent.
 * It uses symbolic simplification (subtraction method) followed by 
 * numeric sampling if simplification is inconclusive.
 */
export function checkEquivalence(
  student: string,
  correct: string,
  options: {
    variables?: string[];
    samples?: Record<string, number>[];
    tolerance?: number;
  } = {}
): EquivalenceResult {
  const normStudent = processForMathJs(student);
  const normCorrect = processForMathJs(correct);
  const diagnostics: string[] = [];

  // Method 1: Literal Identity (after normalization)
  if (normStudent === normCorrect) {
    return {
      isEquivalent: true,
      method: "literal",
      confidence: "high",
      diagnostics: ["Normalized strings are identical."]
    };
  }

  // Method 2: Symbolic Simplification (Subtraction)
  try {
    const diffExpr = `(${normStudent}) - (${normCorrect})`;
    const simplified = simplifyMathExpression(diffExpr);
    if (simplified === "0") {
      return {
        isEquivalent: true,
        method: "symbolicSimplify",
        confidence: "high",
        diagnostics: ["Difference simplified to exactly zero."]
      };
    }
    diagnostics.push(`Symbolic difference simplified to: ${simplified}`);
  } catch (e) {
    diagnostics.push(`Symbolic simplification failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Method 3: Numeric Sampling
  // If the expressions contain variables, we evaluate them at multiple points.
  const vars = options.variables || ["x", "y", "t"];
  const samples = options.samples || generateDefaultSamples(vars);
  const tolerance = options.tolerance ?? 1e-8;

  let tested = 0;
  let passed = 0;

  try {
    const studentNode = parseMathExpression(normStudent);
    const correctNode = parseMathExpression(normCorrect);

    for (const scope of samples) {
      const sVal = evaluateSafely(studentNode, scope);
      const cVal = evaluateSafely(correctNode, scope);

      // Skip points where either is undefined/NaN
      if (!Number.isFinite(sVal) || !Number.isFinite(cVal)) {
        continue;
      }

      tested++;
      const diff = Math.abs(sVal - cVal);
      const allowed = Math.max(tolerance, Math.abs(cVal) * tolerance);
      
      if (diff <= allowed) {
        passed++;
      }
    }

    if (tested > 0 && passed === tested && tested >= 3) {
      return {
        isEquivalent: true,
        method: "symbolicSampled",
        confidence: tested >= 5 ? "medium" : "low",
        diagnostics: [...diagnostics, `Passed ${passed}/${tested} numeric samples.`]
      };
    }
    
    diagnostics.push(`Sample results: ${passed}/${tested} matches.`);
  } catch (e) {
    diagnostics.push(`Sampling failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    isEquivalent: false,
    method: "unresolved",
    confidence: "low",
    diagnostics
  };
}

function generateDefaultSamples(vars: string[]): Record<string, number>[] {
  const points = [0, 1, 2, -1, 0.5, 3.14, 10, -5];
  return points.map(p => {
    const scope: Record<string, number> = {};
    vars.forEach(v => scope[v] = p);
    return scope;
  });
}
