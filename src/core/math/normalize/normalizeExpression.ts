import { NORMALIZATION_PIPELINE, NormalizationStepName } from './normalizationSteps';

export interface NormalizationTraceItem {
  step: NormalizationStepName;
  before: string;
  after: string;
  changed: boolean;
}

export interface NormalizationTrace {
  input: string;
  output: string;
  steps: NormalizationTraceItem[];
}

export const normalizeForMathJs = (expression: string): string =>
  NORMALIZATION_PIPELINE.reduce((current, step) => step.apply(current), expression);

export const traceNormalizationForMathJs = (expression: string): NormalizationTrace => {
  const steps: NormalizationTraceItem[] = [];
  let current = expression;

  for (const step of NORMALIZATION_PIPELINE) {
    const before = current;
    const after = step.apply(before);
    steps.push({
      step: step.name,
      before,
      after,
      changed: before !== after,
    });
    current = after;
  }

  return {
    input: expression,
    output: current,
    steps,
  };
};

export const processForMathJs = normalizeForMathJs;
