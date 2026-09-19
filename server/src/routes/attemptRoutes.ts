import { Router } from 'express';
import { AttemptController } from '../controllers/attemptController.js';

export function createAttemptRoutes(controller: AttemptController): Router {
  const router = Router();
  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/:id/submit', controller.submit);
  router.get('/:id/evaluation', controller.getEvaluation);
  router.post('/:id/evaluate', controller.retryEvaluation);
  router.post('/simulate-failure', controller.toggleSimulateFailure);
  return router;
}
