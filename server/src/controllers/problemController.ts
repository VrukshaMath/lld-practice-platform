import { Request, Response, NextFunction } from 'express';
import { PracticeService } from '../application/PracticeService.js';

export class ProblemController {
  constructor(private practiceService: PracticeService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const learnerId = (req.query.learnerId as string) || 'demo-user';
      const problemsWithCount = await this.practiceService.getAllProblems(learnerId);
      res.json(problemsWithCount);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const problem = await this.practiceService.getProblem(id);
      res.json(problem);
    } catch (err) {
      next(err);
    }
  };
}