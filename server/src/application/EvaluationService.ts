import { AttemptRepository } from '../domain/interfaces/AttemptRepository.js';
import { SubmissionRepository } from '../domain/interfaces/SubmissionRepository.js';
import { ProblemRepository } from '../domain/interfaces/ProblemRepository.js';
import { EvaluationRepository } from '../domain/interfaces/EvaluationRepository.js';
import { Evaluator } from '../domain/interfaces/Evaluator.js';
import { Evaluation } from '../domain/entities/Evaluation.js';
import { NotFoundError } from '../domain/errors/DomainErrors.js';

export class EvaluationService {
  constructor(
    private attemptRepo: AttemptRepository,
    private submissionRepo: SubmissionRepository,
    private problemRepo: ProblemRepository,
    private evaluationRepo: EvaluationRepository,
    private evaluator: Evaluator
  ) {}

  public async evaluateAttempt(attemptId: string): Promise<Evaluation> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt', attemptId);
    }

    const submission = await this.submissionRepo.findByAttemptId(attemptId);
    if (!submission) {
      throw new NotFoundError('Submission for attempt', attemptId);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new NotFoundError('Problem', attempt.problemId);
    }

    // Domain state transition: SUBMITTED -> EVALUATING
    attempt.startEvaluation();
    await this.attemptRepo.save(attempt);

    try {
      // Call evaluator abstraction
      const evaluated = await this.evaluator.evaluate(problem, submission);

      // Persist evaluation
      const savedEvaluation = await this.evaluationRepo.save(evaluated);

      // Domain state transition: EVALUATING -> COMPLETED
      attempt.completeEvaluation();
      await this.attemptRepo.save(attempt);

      return savedEvaluation;
    } catch (err: any) {
      console.error(`Evaluation failed for attempt ${attemptId}:`, err.message);

      // Domain state transition: EVALUATING -> FAILED
      attempt.failEvaluation(err.message || 'Unknown evaluation failure');
      await this.attemptRepo.save(attempt);

      // Persist failed evaluation state
      const failedEvaluation = new Evaluation({
        attemptId,
        status: 'FAILED',
        overallSummary: 'Evaluation failed due to an upstream or processing error.',
        criteria: [],
        strengths: [],
        improvements: [],
        error: err.message || 'Evaluation failed',
      });
      await this.evaluationRepo.save(failedEvaluation);

      throw err;
    }
  }

  public async retryEvaluation(attemptId: string): Promise<void> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt', attemptId);
    }

    // Domain transition: FAILED -> SUBMITTED
    attempt.resetForRetry();
    await this.attemptRepo.save(attempt);

    // Run evaluation asynchronously
    this.evaluateAttempt(attemptId).catch((err) => {
      console.error(`Async retry evaluation error for attempt ${attemptId}:`, err);
    });
  }

  public async getEvaluationByAttemptId(attemptId: string): Promise<Evaluation | null> {
    return this.evaluationRepo.findByAttemptId(attemptId);
  }
}
