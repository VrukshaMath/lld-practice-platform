import { AttemptRepository } from '../domain/interfaces/AttemptRepository.js';
import { SubmissionRepository } from '../domain/interfaces/SubmissionRepository.js';
import { ProblemRepository } from '../domain/interfaces/ProblemRepository.js';
import { EvaluationRepository } from '../domain/interfaces/EvaluationRepository.js';
import { Attempt } from '../domain/entities/Attempt.js';
import { Submission } from '../domain/entities/Submission.js';
import { Problem } from '../domain/entities/Problem.js';
import { NotFoundError, ValidationError } from '../domain/errors/DomainErrors.js';
import { EvaluationService } from './EvaluationService.js';
import { SubmissionInput } from '../validators/submissionValidator.js';

export interface AttemptDetail {
  attempt: Attempt;
  problem: Problem;
  submission?: Submission | null;
  evaluation?: any | null;
  attemptNumber?: number;
}

export class PracticeService {
  constructor(
    private problemRepo: ProblemRepository,
    private attemptRepo: AttemptRepository,
    private submissionRepo: SubmissionRepository,
    private evaluationRepo: EvaluationRepository,
    private evaluationService: EvaluationService
  ) {}

  public async getAllProblems(learnerId = 'demo-user'): Promise<Array<{ problem: Problem; attemptCount: number }>> {
    const problems = await this.problemRepo.findAll();
    const results = await Promise.all(
      problems.map(async (problem) => {
        const count = problem.id
          ? await this.attemptRepo.countByProblemId(problem.id, learnerId)
          : 0;
        return { problem, attemptCount: count };
      })
    );
    return results;
  }

  public async getProblem(idOrSlug: string): Promise<Problem> {
    let problem: Problem | null = null;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await this.problemRepo.findById(idOrSlug);
    }
    if (!problem) {
      problem = await this.problemRepo.findBySlug(idOrSlug);
    }
    if (!problem) {
      throw new NotFoundError('Problem', idOrSlug);
    }
    return problem;
  }

  public async createAttempt(problemId: string, learnerId = 'demo-user'): Promise<Attempt> {
    const problem = await this.getProblem(problemId);
    const attempt = new Attempt({
      problemId: problem.id!,
      learnerId,
      status: 'DRAFT',
    });

    return this.attemptRepo.create(attempt);
  }

  public async getAttempt(attemptId: string): Promise<AttemptDetail> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt', attemptId);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new NotFoundError('Problem', attempt.problemId);
    }

    const submission = await this.submissionRepo.findByAttemptId(attemptId);
    const evaluation = await this.evaluationRepo.findByAttemptId(attemptId);

    // Calculate attempt number chronologically
    const allUserAttempts = await this.attemptRepo.findByProblemId(attempt.problemId, attempt.learnerId);
    const sortedOldestFirst = [...allUserAttempts].sort(
      (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
    );
    const attemptIndex = sortedOldestFirst.findIndex((a) => a.id === attempt.id);
    const attemptNumber = attemptIndex >= 0 ? attemptIndex + 1 : 1;

    return {
      attempt,
      problem,
      submission,
      evaluation,
      attemptNumber,
    };
  }

  public async getAttempts(learnerId = 'demo-user'): Promise<AttemptDetail[]> {
    const attempts = await this.attemptRepo.findByLearnerId(learnerId);

    const details = await Promise.all(
      attempts.map(async (attempt) => {
        const problem = await this.problemRepo.findById(attempt.problemId);
        const evaluation = await this.evaluationRepo.findByAttemptId(attempt.id!);
        return {
          attempt,
          problem: problem!,
          evaluation,
        };
      })
    );

    return details.filter((d) => Boolean(d.problem));
  }

  public async submitSolution(
    attemptId: string,
    input: SubmissionInput
  ): Promise<{ attempt: Attempt; submission: Submission }> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError('Attempt', attemptId);
    }

    const submission = new Submission({
      attemptId,
      assumptions: input.assumptions,
      classes: input.classes,
      relationships: input.relationships,
      abstractions: input.abstractions,
      designDecisions: input.designDecisions,
      edgeCases: input.edgeCases,
    });

    if (!submission.isComplete()) {
      throw new ValidationError('All 6 solution sections are required and cannot be empty.');
    }

    // Step 1: Save submission BEFORE evaluation begins (preservation guarantee)
    const savedSubmission = await this.submissionRepo.save(submission);

    // Step 2: Attempt state machine transition: DRAFT -> SUBMITTED
    attempt.submit();
    const savedAttempt = await this.attemptRepo.save(attempt);

    // Step 3: Trigger asynchronous evaluation in background
    this.evaluationService.evaluateAttempt(attemptId).catch((err) => {
      console.error(`Background evaluation failed for attempt ${attemptId}:`, err.message);
    });

    return {
      attempt: savedAttempt,
      submission: savedSubmission,
    };
  }
}
