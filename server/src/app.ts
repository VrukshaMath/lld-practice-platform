import express from 'express';
import cors from 'cors';
import { MongoProblemRepository } from './infrastructure/database/repositories/MongoProblemRepository.js';
import { MongoAttemptRepository } from './infrastructure/database/repositories/MongoAttemptRepository.js';
import { MongoSubmissionRepository } from './infrastructure/database/repositories/MongoSubmissionRepository.js';
import { MongoEvaluationRepository } from './infrastructure/database/repositories/MongoEvaluationRepository.js';
import { EvaluatorFactory } from './infrastructure/ai/EvaluatorFactory.js';
import { EvaluationService } from './application/EvaluationService.js';
import { PracticeService } from './application/PracticeService.js';
import { ProblemController } from './controllers/problemController.js';
import { AttemptController } from './controllers/attemptController.js';
import { createProblemRoutes } from './routes/problemRoutes.js';
import { createAttemptRoutes } from './routes/attemptRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Instantiate Repositories
  const problemRepo = new MongoProblemRepository();
  const attemptRepo = new MongoAttemptRepository();
  const submissionRepo = new MongoSubmissionRepository();
  const evaluationRepo = new MongoEvaluationRepository();

  // Instantiate Evaluator and Services
  const evaluator = EvaluatorFactory.createEvaluator();
  const evaluationService = new EvaluationService(
    attemptRepo,
    submissionRepo,
    problemRepo,
    evaluationRepo,
    evaluator
  );
  const practiceService = new PracticeService(
    problemRepo,
    attemptRepo,
    submissionRepo,
    evaluationRepo,
    evaluationService
  );

  // Instantiate Controllers
  const problemController = new ProblemController(practiceService);
  const attemptController = new AttemptController(practiceService, evaluationService);

  // Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/problems', createProblemRoutes(problemController));
  app.use('/api/attempts', createAttemptRoutes(attemptController));

  // Central Error Handling
  app.use(errorHandler);

  return {
    app,
    problemRepo,
    attemptRepo,
    submissionRepo,
    evaluationRepo,
    practiceService,
    evaluationService,
  };
}
