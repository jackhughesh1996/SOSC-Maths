import { DynamicTestManifest, QuestionResponse, RubricReport } from "../schema/DynamicTestTypes";

/**
 * Calculates a detailed rubric breakdown for a set of student responses.
 * Matches the logic in SubmissionBuilder but provided as a standalone utility.
 */
export function calculateRubricScoring(
  manifest: DynamicTestManifest,
  responses: QuestionResponse[]
): RubricReport[] {
  return manifest.rubric.skills.map(skill => {
    // 1. Identify which questions contribute to this skill
    const skillQuestions = manifest.questions.filter(q => q.rubric.skillId === skill.id);
    const skillQuestionIds = new Set(skillQuestions.map(q => q.id));

    // 2. Filter responses that belong to these questions
    const relevantResponses = responses.filter(r => skillQuestionIds.has(r.questionId));

    // 3. Calculate metrics
    const marksAwarded = relevantResponses.reduce((sum, r) => sum + r.marksAwarded, 0);
    const maxMarks = skillQuestions.reduce((sum, q) => sum + q.rubric.maxMarks, 0);
    const percent = maxMarks === 0 ? 0 : (marksAwarded / maxMarks) * 100;

    // 4. Determine Mastery Band
    const masteryBand = [...manifest.rubric.masteryBands]
      .sort((a, b) => b.minPercent - a.minPercent)
      .find(band => percent >= band.minPercent)?.label ?? "Unrated";

    // 5. Audit stats
    const assistedCorrectCount = relevantResponses.filter(r => r.assisted && r.isCorrect).length;
    const incorrectCount = relevantResponses.filter(r => !r.isCorrect).length;

    return {
      skillId: skill.id,
      skillName: skill.name,
      marksAwarded,
      maxMarks,
      percent,
      masteryBand,
      assistedCorrectCount,
      incorrectCount
    };
  });
}
