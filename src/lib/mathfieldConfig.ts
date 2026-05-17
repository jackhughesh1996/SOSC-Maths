/**
 * @anchor AGENTS.md
 * This file adheres to the MathGraph Pro Memory Bank architectural rules.
 * Update the 'Refactoring History' or 'Known Debt' in AGENTS.md upon modification.
 */
import type { MathfieldOptions } from 'mathlive';

/**
 * Common configuration for MathLive math-fields to ensure consistent behavior
 * across the application and avoid "too smart" behaviors that conflict with mathjs.
 */
export const MATHFIELD_DEFAULT_OPTIONS: Partial<MathfieldOptions> = {
  inlineShortcuts: {
    'log': '\\log',
    'ln': '\\ln',
    'pi': '\\pi',
    'sqrt': '\\sqrt{#@}',
    'sin': '\\sin',
    'cos': '\\cos',
    'tan': '\\tan',
    'asin': '\\arcsin',
    'acos': '\\arccos',
    'atan': '\\arctan',
    'csc': '\\csc',
    'sec': '\\sec',
    'cot': '\\cot',
    'exp': 'e^{#@}',
    'ee': 'e^{#@}',
  },
  // Add other global defaults here if needed
  mathVirtualKeyboardPolicy: 'manual' as any,
};

/**
 * Returns combined options with defaults
 */
export const getMathfieldOptions = (customOptions: Partial<MathfieldOptions> = {}): Partial<MathfieldOptions> => {
  return {
    ...MATHFIELD_DEFAULT_OPTIONS,
    ...customOptions,
    inlineShortcuts: {
      ...MATHFIELD_DEFAULT_OPTIONS.inlineShortcuts,
      ...(customOptions.inlineShortcuts || {}),
    },
  };
};
