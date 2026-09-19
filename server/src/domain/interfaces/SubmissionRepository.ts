import { Submission } from '../entities/Submission.js';

export interface SubmissionRepository {
  findByAttemptId(attemptId: string): Promise<Submission | null>;
  create(submission: Submission): Promise<Submission>;
  save(submission: Submission): Promise<Submission>;
  deleteAll(): Promise<void>;
}
