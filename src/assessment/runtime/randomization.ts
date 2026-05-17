import { evaluateExpression } from "../../core/math";
import { RandomVariableDefinition, ResolvedVariableValue, ResolvedVariables } from "../schema/DynamicTestTypes";

/**
 * A seeded random number generator (Mulberry32).
 * Ensures reproducibility given a string or numeric seed.
 */
export function createSeededRng(seed: string | number) {
  let h = 0;
  if (typeof seed === "string") {
    // Simple string hash
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
  } else {
    h = seed | 0;
  }
  
  return function() {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Resolves all random variable definitions using a seeded RNG.
 * Supports integer, decimal, choice, and derived variables.
 */
export function resolveRandomVariables(
  definitions: Record<string, RandomVariableDefinition>,
  seed: string
): ResolvedVariables {
  const rng = createSeededRng(seed);
  const resolved: ResolvedVariables = {};

  // We iterate in order of keys. 
  // IMPORTANT: For derived variables to work, dependencies must be defined before them
  // or we need to implement a dependency graph. 
  // For v1, we assume linear dependency based on object key order or just try-catch.
  for (const [name, def] of Object.entries(definitions)) {
    try {
      resolved[name] = resolveSingleVariable(def, rng, resolved);
    } catch (error) {
      throw new Error(`Failed to resolve variable "${name}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return resolved;
}

function resolveSingleVariable(
  def: RandomVariableDefinition,
  rng: () => number,
  context: ResolvedVariables
): ResolvedVariableValue {
  switch (def.type) {
    case "integer": {
      const { min, max, exclude = [] } = def;
      let val: number;
      let attempts = 0;
      do {
        val = Math.floor(rng() * (max - min + 1)) + min;
        attempts++;
      } while (exclude.includes(val) && attempts < 100);
      return val;
    }
    case "decimal": {
      const { min, max, step, decimals = 2 } = def;
      let val: number;
      if (step) {
        const steps = Math.floor((max - min) / step);
        val = min + (Math.floor(rng() * (steps + 1)) * step);
      } else {
        val = rng() * (max - min) + min;
      }
      return parseFloat(val.toFixed(decimals));
    }
    case "choice": {
      const index = Math.floor(rng() * def.values.length);
      const value = def.values[index];
      if (value === undefined) {
        throw new Error("Choice variable has no selectable values.");
      }
      return value;
    }
    case "derived": {
      const numericContext = toNumericScope(context);
      const result = evaluateExpression(def.expression, numericContext);
      if (!result.ok) {
        throw new Error(`Expression "${def.expression}" failed: ${result.error ?? 'invalid numeric result'}`);
      }
      return result.value;
    }
    default:
      return assertNever(def);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unknown variable definition: ${JSON.stringify(value)}`);
}

function toNumericScope(variables: ResolvedVariables): Record<string, number> {
  return Object.fromEntries(
    Object.entries(variables).filter((entry): entry is [string, number] => typeof entry[1] === 'number')
  );
}

/**
 * Interpolates a template string (Markdown or LaTeX) with resolved variables.
 * Format: {{variable_name}} or {{expression}}
 */
export function interpolateTemplate(
  template: string,
  variables: ResolvedVariables
): string {
  if (!template) return template;

  return template.replace(/\{\{(.*?)\}\}/g, (match, expression) => {
    const trimmed = expression.trim();
    
    // 1. Check if it's a direct variable name
    if (Object.prototype.hasOwnProperty.call(variables, trimmed)) {
      return String(variables[trimmed]);
    }

    // 2. Otherwise try to evaluate as an expression
    try {
      const result = evaluateExpression(trimmed, toNumericScope(variables));
      return result.ok ? String(result.value) : `[Error: ${trimmed} is NaN]`;
    } catch (e) {
      console.error(`Interpolation error for "${trimmed}":`, e);
      return `[Error: ${trimmed}]`;
    }
  });
}
