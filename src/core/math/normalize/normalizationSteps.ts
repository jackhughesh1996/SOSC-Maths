export type NormalizationStepName =
  | 'trimInput'
  | 'removeInvisibleArtifacts'
  | 'unwrapLatexTextCommands'
  | 'removeFenceSizingCommands'
  | 'normalizeMultiplicationAndConstants'
  | 'normalizeFractions'
  | 'normalizeLogBases'
  | 'normalizeTrigPowers'
  | 'normalizeFunctionCommands'
  | 'normalizeBracedFunctionArguments'
  | 'normalizePowers'
  | 'normalizeNaturalLogs'
  | 'normalizeImplicitFunctionArguments'
  | 'normalizeRemainingGroups'
  | 'stripRemainingLatexEscapes';

export interface NormalizationStep {
  name: NormalizationStepName;
  apply: (input: string) => string;
}

const MATH_FUNCTIONS = [
  'arcsin',
  'arccos',
  'arctan',
  'atan2',
  'asin',
  'acos',
  'atan',
  'sin',
  'cos',
  'tan',
  'csc',
  'sec',
  'cot',
  'log',
  'ln',
  'exp',
  'sqrt',
] as const;

const TRIG_POWER_FUNCTIONS = [
  'sin',
  'cos',
  'tan',
  'csc',
  'sec',
  'cot',
  'asin',
  'acos',
  'atan',
  'arcsin',
  'arccos',
  'arctan',
] as const;

export const trimInput = (input: string): string => input.trim();

export const removeInvisibleArtifacts = (input: string): string =>
  input
    .replace(/\u2061/g, '')
    .replace(/\\u2061/g, '')
    .replace(/\\[,;:!]/g, '');

export const unwrapLatexTextCommands = (input: string): string =>
  input.replace(/\\(?:operatorname|mathrm|text)\{([a-zA-Z]+)\}/g, '$1');

export const removeFenceSizingCommands = (input: string): string =>
  input.replace(
    /\\(?:left|right|mleft|mright|big|Big|bigg|Bigg|bigl|bigr|Bigl|Bigr|biggl|biggr|Biggl|Biggr)/g,
    ''
  );

export const normalizeMultiplicationAndConstants = (input: string): string =>
  input
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\pi/g, 'pi')
    .replace(/π/g, 'pi')
    .replace(/\\phi/g, 'phi')
    .replace(/\\theta/g, 'theta')
    .replace(/\\infty/g, 'Infinity');

export const normalizeFractions = (input: string): string => {
  let current = input;
  let previous: string;

  do {
    previous = current;
    current = current.replace(
      /\\frac\{((?:[^{}]|\{[^{}]*\})*)\}\{((?:[^{}]|\{[^{}]*\})*)\}/g,
      '(($1)/($2))'
    );
  } while (current !== previous);

  return current;
};

export const normalizeLogBases = (input: string): string =>
  input.replace(
    /\\?log\s*_\s*\{?([0-9.]+)\}?\s*(?:\(([^()]*)\)|\{([^{}]*)\}|([a-zA-Z0-9.][a-zA-Z0-9.]*))/g,
    (_match: string, base: string, parenArg?: string, braceArg?: string, bareArg?: string): string => {
      const arg = parenArg ?? braceArg ?? bareArg ?? '';
      return `log(${arg}, ${base})`;
    }
  );

export const normalizeTrigPowers = (input: string): string =>
  TRIG_POWER_FUNCTIONS.reduce((current, fn) => {
    const pattern = new RegExp(
      `\\\\?${fn}\\^\\{?([^\\s{}()]+)\\}?\\s*(?:\\(([^()]*)\\)|\\{([^{}]*)\\}|([a-zA-Z0-9.][a-zA-Z0-9.]*))`,
      'g'
    );

    return current.replace(
      pattern,
      (_match: string, power: string, parenArg?: string, braceArg?: string, bareArg?: string): string => {
        const arg = parenArg ?? braceArg ?? bareArg ?? '';
        return `(${fn}(${arg}))^(${power})`;
      }
    );
  }, input);

export const normalizeFunctionCommands = (input: string): string =>
  MATH_FUNCTIONS.reduce(
    (current, fn) => current.replace(new RegExp(`\\\\${fn}`, 'g'), fn),
    input
  );

export const normalizeBracedFunctionArguments = (input: string): string =>
  MATH_FUNCTIONS.reduce(
    (current, fn) => current.replace(new RegExp(`\\b${fn}\\s*\\{([^{}]+)\\}`, 'g'), `${fn}($1)`),
    input
  );

export const normalizePowers = (input: string): string => input.replace(/\^\{([^}]*)\}/g, '^($1)');

export const normalizeNaturalLogs = (input: string): string => input.replace(/\bln\b/g, 'log');

export const normalizeImplicitFunctionArguments = (input: string): string =>
  MATH_FUNCTIONS.reduce((current, fn) => {
    const spacedArgumentPattern = new RegExp(`\\b(${fn})\\s+([a-zA-Z0-9.]+)(?!\\()`, 'g');
    const directVariablePattern = new RegExp(`\\b(${fn})([xyt])(?!\\w)`, 'g');

    return current.replace(spacedArgumentPattern, '$1($2)').replace(directVariablePattern, '$1($2)');
  }, input);

export const normalizeRemainingGroups = (input: string): string =>
  input.replace(/\{/g, '(').replace(/\}/g, ')');

export const stripRemainingLatexEscapes = (input: string): string => input.replace(/\\/g, '');

export const NORMALIZATION_PIPELINE: readonly NormalizationStep[] = [
  { name: 'trimInput', apply: trimInput },
  { name: 'removeInvisibleArtifacts', apply: removeInvisibleArtifacts },
  { name: 'unwrapLatexTextCommands', apply: unwrapLatexTextCommands },
  { name: 'removeFenceSizingCommands', apply: removeFenceSizingCommands },
  { name: 'normalizeMultiplicationAndConstants', apply: normalizeMultiplicationAndConstants },
  { name: 'normalizeFractions', apply: normalizeFractions },
  { name: 'normalizeLogBases', apply: normalizeLogBases },
  { name: 'normalizeTrigPowers', apply: normalizeTrigPowers },
  { name: 'normalizeFunctionCommands', apply: normalizeFunctionCommands },
  { name: 'normalizeBracedFunctionArguments', apply: normalizeBracedFunctionArguments },
  { name: 'normalizePowers', apply: normalizePowers },
  { name: 'normalizeNaturalLogs', apply: normalizeNaturalLogs },
  { name: 'normalizeImplicitFunctionArguments', apply: normalizeImplicitFunctionArguments },
  { name: 'normalizeRemainingGroups', apply: normalizeRemainingGroups },
  { name: 'stripRemainingLatexEscapes', apply: stripRemainingLatexEscapes },
];
