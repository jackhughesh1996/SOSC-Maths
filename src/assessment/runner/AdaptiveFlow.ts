import { DynamicTestManifest, DynamicQuestion, QuestionResponse } from "../schema/DynamicTestTypes";

export class AdaptiveFlow {
  /**
   * Resolves the next question ID based on the current performance and adaptive rules.
   */
  static resolveNextQuestion(
    manifest: DynamicTestManifest,
    currentQuestionId: string,
    response: QuestionResponse
  ): string | null {
    const question = manifest.questions.find(q => q.id === currentQuestionId);
    if (!question) return manifest.flow.defaultNext ?? null;

    if (manifest.flow.navigation !== "adaptive") {
      return this.getNextLinearQuestion(manifest, currentQuestionId);
    }

    const adaptive = question.adaptive;
    if (!adaptive) {
      return manifest.flow.defaultNext ?? this.getNextLinearQuestion(manifest, currentQuestionId);
    }

    // 1. If correct and unassisted
    if (response.isCorrect && !response.assisted) {
      return adaptive.onCorrect || adaptive.extensionQuestionId || manifest.flow.defaultNext || this.getNextLinearQuestion(manifest, currentQuestionId);
    }

    // 2. If correct but assisted
    if (response.isCorrect && response.assisted) {
      return adaptive.onAssistedCorrect || adaptive.onIncorrect || manifest.flow.defaultNext || this.getNextLinearQuestion(manifest, currentQuestionId);
    }

    // 3. If incorrect
    return adaptive.onIncorrect || adaptive.prerequisiteQuestionId || manifest.flow.defaultNext || this.getNextLinearQuestion(manifest, currentQuestionId);
  }

  private static getNextLinearQuestion(manifest: DynamicTestManifest, currentId: string): string | null {
    const currentIndex = manifest.questions.findIndex(q => q.id === currentId);
    if (currentIndex === -1 || currentIndex === manifest.questions.length - 1) {
      return null;
    }
    return manifest.questions[currentIndex + 1].id;
  }
}
