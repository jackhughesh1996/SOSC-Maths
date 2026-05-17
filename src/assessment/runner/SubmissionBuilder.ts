import { 
  DynamicTestManifest, 
  MonitoringSnapshot,
  TestSubmission, 
  QuestionResponse, 
  ResolvedVariables,
  RubricReport,
  StudentIdentity,
  SubmitReason 
} from "../schema/DynamicTestTypes";

export class SubmissionBuilder {
  static buildSubmission(data: {
    manifest: DynamicTestManifest,
    student: StudentIdentity,
    attempt: {
      attemptId: string,
      seed: string,
      startedAt: string,
      submittedAt: string,
      submitReason: SubmitReason,
      durationSeconds: number
    },
    resolvedVariables: ResolvedVariables,
    responses: QuestionResponse[],
    monitoring: MonitoringSnapshot
  }): TestSubmission {
    const rawMarks = data.responses.reduce((sum, r) => sum + r.marksAwarded, 0);
    const maxMarks = data.responses.reduce((sum, r) => sum + r.maxMarks, 0);
    const percent = maxMarks === 0 ? 0 : (rawMarks / maxMarks) * 100;
    const assistedQuestions = data.responses.filter(r => r.assisted).length;

    const rubrics = this.buildRubricReport(data.manifest, data.responses);

    return {
      schemaVersion: "mathgraph-submission-v1",
      testId: data.manifest.testId,
      manifestHash: "sha256-placeholder", // In a real app we'd hash the manifest
      student: data.student,
      attempt: data.attempt,
      resolvedVariables: data.resolvedVariables,
      responses: data.responses,
      score: {
        rawMarks,
        maxMarks,
        percent,
        assistedQuestions
      },
      rubrics,
      monitoring: data.monitoring
    };
  }

  private static buildRubricReport(
    manifest: DynamicTestManifest,
    responses: QuestionResponse[]
  ): RubricReport[] {
    return manifest.rubric.skills.map(skill => {
      const skillQuestions = manifest.questions.filter(q => q.rubric.skillId === skill.id);
      const relevantResponses = responses.filter(r => 
        skillQuestions.some(q => q.id === r.questionId)
      );

      const marksAwarded = relevantResponses.reduce((sum, r) => sum + r.marksAwarded, 0);
      const maxMarks = skillQuestions.reduce((sum, q) => sum + q.rubric.maxMarks, 0);
      const percent = maxMarks === 0 ? 0 : (marksAwarded / maxMarks) * 100;

      const masteryBand = [...manifest.rubric.masteryBands]
        .sort((a, b) => b.minPercent - a.minPercent)
        .find(band => percent >= band.minPercent)?.label ?? "Unrated";

      return {
        skillId: skill.id,
        skillName: skill.name,
        marksAwarded,
        maxMarks,
        percent,
        masteryBand,
        assistedCorrectCount: relevantResponses.filter(r => r.assisted && r.isCorrect).length,
        incorrectCount: relevantResponses.filter(r => !r.isCorrect).length
      };
    });
  }
}
