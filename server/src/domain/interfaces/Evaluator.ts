import { Problem } from '../entities/Problem.js';
import { Submission } from '../entities/Submission.js';
import { Evaluation } from '../entities/Evaluation.js';

export interface Evaluator {
  evaluate(problem: Problem, submission: Submission): Promise<Evaluation>;
}
