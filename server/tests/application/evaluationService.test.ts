import { describe, it, expect, beforeEach } from 'vitest';
import { EvaluationService } from '../../src/application/EvaluationService.js';
import { Attempt } from '../../src/domain/entities/Attempt.js';
import { Submission } from '../../src/domain/entities/Submission.js';
import { Problem } from '../../src/domain/entities/Problem.js';
import { Evaluation } from '../../src/domain/entities/Evaluation.js';
import { Evaluator } from '../../src/domain/interfaces/Evaluator.js';
import { AttemptRepository } from '../../src/domain/interfaces/AttemptRepository.js';
import { SubmissionRepository } from '../../src/domain/interfaces/SubmissionRepository.js';
import { ProblemRepository } from '../../src/domain/interfaces/ProblemRepository.js';
import { EvaluationRepository } from '../../src/domain/interfaces/EvaluationRepository.js';

// In-memory fake repositories for high-speed deterministic unit testing
class FakeAttemptRepository implements AttemptRepository {
  private store = new Map<string, Attempt>();

  async findById(id: string): Promise<Attempt | null> {
    return this.store.get(id) || null;
  }
  async findByLearnerId(learnerId: string): Promise<Attempt[]> {
    return Array.from(this.store.values()).filter((a) => a.learnerId === learnerId);
  }
  async findByProblemId(problemId: string, learnerId?: string): Promise<Attempt[]> {
    return Array.from(this.store.values()).filter(
      (a) => a.problemId === problemId && (!learnerId || a.learnerId === learnerId)
    );
  }
  async countByProblemId(problemId: string, learnerId?: string): Promise<number> {
    return (await this.findByProblemId(problemId, learnerId)).length;
  }
  async create(attempt: Attempt): Promise<Attempt> {
    const id = attempt.id || `att-${Date.now()}-${Math.random()}`;
    const created = new Attempt({ ...attempt.toJSON(), id });
    this.store.set(id, created);
    return created;
  }
  async save(attempt: Attempt): Promise<Attempt> {
    this.store.set(attempt.id!, attempt);
    return attempt;
  }
  async deleteAll(): Promise<void> {
    this.store.clear();
  }
}

class FakeSubmissionRepository implements SubmissionRepository {
  private store = new Map<string, Submission>();

  async findByAttemptId(attemptId: string): Promise<Submission | null> {
    return this.store.get(attemptId) || null;
  }
  async create(submission: Submission): Promise<Submission> {
    this.store.set(submission.attemptId, submission);
    return submission;
  }
  async save(submission: Submission): Promise<Submission> {
    this.store.set(submission.attemptId, submission);
    return submission;
  }
  async deleteAll(): Promise<void> {
    this.store.clear();
  }
}

class FakeProblemRepository implements ProblemRepository {
  private store = new Map<string, Problem>();

  async findAll(): Promise<Problem[]> {
    return Array.from(this.store.values());
  }
  async findById(id: string): Promise<Problem | null> {
    return this.store.get(id) || null;
  }
  async findBySlug(slug: string): Promise<Problem | null> {
    return Array.from(this.store.values()).find((p) => p.slug === slug) || null;
  }
  async create(problem: Problem): Promise<Problem> {
    const id = problem.id || `prob-${Date.now()}`;
    const created = new Problem({ ...problem, id });
    this.store.set(id, created);
    return created;
  }
  async deleteAll(): Promise<void> {
    this.store.clear();
  }
}

class FakeEvaluationRepository implements EvaluationRepository {
  private store = new Map<string, Evaluation>();

  async findByAttemptId(attemptId: string): Promise<Evaluation | null> {
    return this.store.get(attemptId) || null;
  }
  async create(evaluation: Evaluation): Promise<Evaluation> {
    this.store.set(evaluation.attemptId, evaluation);
    return evaluation;
  }
  async save(evaluation: Evaluation): Promise<Evaluation> {
    this.store.set(evaluation.attemptId, evaluation);
    return evaluation;
  }
  async deleteAll(): Promise<void> {
    this.store.clear();
  }
}

class MockEvaluator implements Evaluator {
  public failNext = false;

  async evaluate(problem: Problem, submission: Submission): Promise<Evaluation> {
    if (this.failNext) {
      throw new Error('AI Evaluation Provider Timeout (Simulated)');
    }
    return new Evaluation({
      attemptId: submission.attemptId,
      status: 'COMPLETED',
      overallSummary: 'High quality object-oriented design.',
      criteria: [
        {
          criterion: 'Class Responsibilities',
          score: 4,
          evidence: 'Classes follow Single Responsibility Principle.',
          concern: 'None',
          suggestion: 'Extract fee calculation strategy.',
          confidence: 0.95,
        },
      ],
      strengths: ['Clear encapsulation'],
      improvements: ['Consider concurrency edge cases'],
    });
  }
}

describe('EvaluationService (Application Layer)', () => {
  let attemptRepo: FakeAttemptRepository;
  let submissionRepo: FakeSubmissionRepository;
  let problemRepo: FakeProblemRepository;
  let evaluationRepo: FakeEvaluationRepository;
  let mockEvaluator: MockEvaluator;
  let service: EvaluationService;

  let testProblem: Problem;
  let testAttempt: Attempt;
  let testSubmission: Submission;

  beforeEach(async () => {
    attemptRepo = new FakeAttemptRepository();
    submissionRepo = new FakeSubmissionRepository();
    problemRepo = new FakeProblemRepository();
    evaluationRepo = new FakeEvaluationRepository();
    mockEvaluator = new MockEvaluator();

    service = new EvaluationService(
      attemptRepo,
      submissionRepo,
      problemRepo,
      evaluationRepo,
      mockEvaluator
    );

    testProblem = await problemRepo.create(
      new Problem({
        slug: 'parking-lot',
        title: 'Parking Lot',
        description: 'Design a multi-floor parking lot',
        difficulty: 'Easy',
        concepts: ['OOP', 'Encapsulation'],
        requirements: ['Support cars, trucks', 'Issue tickets'],
        evaluationFocus: ['Class responsibilities', 'Extensibility'],
      })
    );

    testAttempt = await attemptRepo.create(
      new Attempt({
        problemId: testProblem.id!,
        learnerId: 'demo-user',
        status: 'SUBMITTED',
      })
    );

    testSubmission = await submissionRepo.create(
      new Submission({
        attemptId: testAttempt.id!,
        assumptions: 'Single entrance per floor',
        classes: 'ParkingLot, Spot, Vehicle',
        relationships: 'ParkingLot has Spots',
        abstractions: 'IPricingStrategy',
        designDecisions: 'Strategy pattern for pricing',
        edgeCases: 'Full capacity rejects entry',
      })
    );
  });

  it('1. Evaluation is stored and 2. Attempt becomes COMPLETED upon successful evaluation', async () => {
    const evaluation = await service.evaluateAttempt(testAttempt.id!);

    expect(evaluation).toBeDefined();
    expect(evaluation.status).toBe('COMPLETED');
    expect(evaluation.overallSummary).toBe('High quality object-oriented design.');
    expect(evaluation.getAverageScore()).toBe(4);

    const savedEvaluation = await evaluationRepo.findByAttemptId(testAttempt.id!);
    expect(savedEvaluation).not.toBeNull();
    expect(savedEvaluation?.overallSummary).toBe('High quality object-oriented design.');

    const updatedAttempt = await attemptRepo.findById(testAttempt.id!);
    expect(updatedAttempt?.getStatus()).toBe('COMPLETED');
    expect(updatedAttempt?.evaluationCompletedAt).toBeInstanceOf(Date);
  });

  it('3. AI failure causes Attempt status to become FAILED', async () => {
    mockEvaluator.failNext = true;

    await expect(service.evaluateAttempt(testAttempt.id!)).rejects.toThrow(
      'AI Evaluation Provider Timeout (Simulated)'
    );

    const updatedAttempt = await attemptRepo.findById(testAttempt.id!);
    expect(updatedAttempt?.getStatus()).toBe('FAILED');
    expect(updatedAttempt?.evaluationError).toContain('AI Evaluation Provider Timeout');
  });

  it('4. Learner submission remains safely stored after AI failure', async () => {
    mockEvaluator.failNext = true;

    try {
      await service.evaluateAttempt(testAttempt.id!);
    } catch {
      // Expected rejection
    }

    const preservedSubmission = await submissionRepo.findByAttemptId(testAttempt.id!);
    expect(preservedSubmission).not.toBeNull();
    expect(preservedSubmission?.classes).toBe('ParkingLot, Spot, Vehicle');
    expect(preservedSubmission?.assumptions).toBe('Single entrance per floor');
  });

  it('5. Retry works: Failed attempt can be retried and completes successfully', async () => {
    // Fail first
    mockEvaluator.failNext = true;
    try {
      await service.evaluateAttempt(testAttempt.id!);
    } catch {
      // Expected
    }

    let attempt = await attemptRepo.findById(testAttempt.id!);
    expect(attempt?.getStatus()).toBe('FAILED');

    // Enable success on next attempt
    mockEvaluator.failNext = false;

    // Retry evaluation
    await service.retryEvaluation(testAttempt.id!);

    // Wait microtask for async execution
    await new Promise((resolve) => setTimeout(resolve, 50));

    const finalAttempt = await attemptRepo.findById(testAttempt.id!);
    expect(finalAttempt?.getStatus()).toBe('COMPLETED');

    const finalEvaluation = await evaluationRepo.findByAttemptId(testAttempt.id!);
    expect(finalEvaluation?.status).toBe('COMPLETED');
    expect(finalEvaluation?.getAverageScore()).toBe(4);
  });
});