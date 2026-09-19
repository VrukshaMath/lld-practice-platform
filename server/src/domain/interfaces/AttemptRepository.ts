import { Attempt } from '../entities/Attempt.js';

export interface AttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByLearnerId(learnerId: string): Promise<Attempt[]>;
  findByProblemId(problemId: string, learnerId?: string): Promise<Attempt[]>;
  countByProblemId(problemId: string, learnerId?: string): Promise<number>;
  create(attempt: Attempt): Promise<Attempt>;
  save(attempt: Attempt): Promise<Attempt>;
  deleteAll(): Promise<void>;
}
