import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  DomainError,
  InvalidStateTransitionError,
  ValidationError,
  NotFoundError,
} from '../domain/errors/DomainErrors.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(400).json({
      error: err.message,
      details: err.errors,
    });
    return;
  }

  if (err instanceof InvalidStateTransitionError) {
    res.status(400).json({
      error: err.message,
      type: 'INVALID_STATE_TRANSITION',
    });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
      type: 'NOT_FOUND',
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(400).json({
      error: err.message,
      type: 'DOMAIN_ERROR',
    });
    return;
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
}
