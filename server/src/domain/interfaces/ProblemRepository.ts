import { Problem } from '../entities/Problem.js';

export interface ProblemRepository {
  findAll(): Promise<Problem[]>;
  findById(id: string): Promise<Problem | null>;
  findBySlug(slug: string): Promise<Problem | null>;
  create(problem: Problem): Promise<Problem>;
  deleteAll(): Promise<void>;
}
