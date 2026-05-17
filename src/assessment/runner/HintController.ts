import { DynamicQuestion, ProgressiveHint } from "../schema/DynamicTestTypes";

export interface HintState {
  revealedLevels: number[];
  isAssisted: boolean;
}

export class HintController {
  /**
   * Returns the next available hint level for a question.
   */
  static getNextHintLevel(question: DynamicQuestion, currentlyRevealed: number[]): number | null {
    const allLevels = question.hints.map(h => h.level).sort((a, b) => a - b);
    const next = allLevels.find(l => !currentlyRevealed.includes(l));
    return next ?? null;
  }

  /**
   * Checks if the hint being revealed should mark the question as assisted.
   */
  static shouldMarkAsAssisted(hint: ProgressiveHint): boolean {
    return !!hint.penalty?.markAsAssisted;
  }

  /**
   * Gets the hint object for a specific level.
   */
  static getHintByLevel(question: DynamicQuestion, level: number): ProgressiveHint | null {
    return question.hints.find(h => h.level === level) ?? null;
  }
}
