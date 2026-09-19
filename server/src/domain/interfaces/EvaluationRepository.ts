import { Evaluation } from '../entities/Evaluation.js';

export interface EvaluationRepository {
  findByAttemptId(attemptId: string): Promise<Evaluation | null>;
  create(evaluation: Evaluation): Promise<Evaluation>;
  save(evaluation: Evaluation): Promise<Evaluation>;
  deleteAll(): Promise<void>;
}
