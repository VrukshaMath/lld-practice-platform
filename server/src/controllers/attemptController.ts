import { Request, Response, NextFunction } from 'express';
import { PracticeService } from '../application/PracticeService.js';
import { EvaluationService } from '../application/EvaluationService.js';
import { SubmissionInputSchema, CreateAttemptSchema } from '../validators/submissionValidator.js';
import { EvaluatorFactory } from '../infrastructure/ai/EvaluatorFactory.js';

export class AttemptController {
  constructor(
    private practiceService: PracticeService,
    private evaluationService: EvaluationService
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { problemId } = CreateAttemptSchema.parse(req.body);
      const learnerId = (req.body.learnerId as string) || 'demo-user';
      const attempt = await this.practiceService.createAttempt(problemId, learnerId);
      res.status(201).json(attempt.toJSON());
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = (req.query.learnerId as string) || 'demo-user';
      const attempts = await this.practiceService.getAttempts(learnerId);
      res.json(
        attempts.map((d) => ({
          attempt: d.attempt.toJSON(),
          problem: d.problem,
          evaluation: d.evaluation?.toJSON?.() || d.evaluation,
        }))
      );
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const detail = await this.practiceService.getAttempt(id);
      res.json({
        attempt: detail.attempt.toJSON(),
        problem: detail.problem,
        submission: detail.submission?.toJSON?.() || detail.submission,
        evaluation: detail.evaluation?.toJSON?.() || detail.evaluation,
        attemptNumber: detail.attemptNumber,
      });
    } catch (err) {
      next(err);
    }
  };

  submit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const input = SubmissionInputSchema.parse(req.body);
      const result = await this.practiceService.submitSolution(id, input);
      res.status(200).json({
        attempt: result.attempt.toJSON(),
        submission: result.submission.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  };

  getEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const evaluation = await this.evaluationService.getEvaluationByAttemptId(id);
      if (!evaluation) {
        res.status(404).json({ error: 'Evaluation not found for this attempt' });
        return;
      }
      res.json(evaluation.toJSON());
    } catch (err) {
      next(err);
    }
  };

  retryEvaluation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.evaluationService.retryEvaluation(id);
      res.status(200).json({ message: 'Evaluation retry initiated' });
    } catch (err) {
      next(err);
    }
  };

  toggleSimulateFailure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fail } = req.body;
      EvaluatorFactory.setSimulateFailure(Boolean(fail));
      res.json({ simulateFailure: EvaluatorFactory.getSimulateFailure() });
    } catch (err) {
      next(err);
    }
  };
}