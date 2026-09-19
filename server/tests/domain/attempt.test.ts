import { describe, it, expect } from 'vitest';
import { Attempt } from '../../src/domain/entities/Attempt.js';
import { InvalidStateTransitionError } from '../../src/domain/errors/DomainErrors.js';

describe('Attempt State Machine (Domain Layer)', () => {
  it('1. Draft can submit', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'DRAFT',
    });

    expect(attempt.getStatus()).toBe('DRAFT');
    expect(attempt.submittedAt).toBeUndefined();

    attempt.submit();

    expect(attempt.getStatus()).toBe('SUBMITTED');
    expect(attempt.submittedAt).toBeInstanceOf(Date);
  });

  it('2. Cannot submit twice', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'DRAFT',
    });

    attempt.submit();
    expect(attempt.getStatus()).toBe('SUBMITTED');

    expect(() => attempt.submit()).toThrow(InvalidStateTransitionError);
    expect(() => attempt.submit()).toThrow(/Cannot perform 'submit' on an attempt with status 'SUBMITTED'/);
  });

  it('3. Submitted can enter evaluating', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'SUBMITTED',
    });

    attempt.startEvaluation();

    expect(attempt.getStatus()).toBe('EVALUATING');
    expect(attempt.evaluationStartedAt).toBeInstanceOf(Date);
  });

  it('4. Cannot evaluate draft', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'DRAFT',
    });

    expect(() => attempt.startEvaluation()).toThrow(InvalidStateTransitionError);
    expect(() => attempt.startEvaluation()).toThrow(/Cannot perform 'startEvaluation' on an attempt with status 'DRAFT'/);
  });

  it('5. Evaluating can complete', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'EVALUATING',
    });

    attempt.completeEvaluation();

    expect(attempt.getStatus()).toBe('COMPLETED');
    expect(attempt.evaluationCompletedAt).toBeInstanceOf(Date);
    expect(attempt.evaluationError).toBeUndefined();
  });

  it('6. Evaluating can fail', () => {
    const attempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'EVALUATING',
    });

    const errorMsg = 'AI rate limit exceeded';
    attempt.failEvaluation(errorMsg);

    expect(attempt.getStatus()).toBe('FAILED');
    expect(attempt.evaluationCompletedAt).toBeInstanceOf(Date);
    expect(attempt.evaluationError).toBe(errorMsg);
  });

  it('7. Invalid transitions throw domain errors', () => {
    // Cannot complete a DRAFT
    const draftAttempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'DRAFT',
    });
    expect(() => draftAttempt.completeEvaluation()).toThrow(InvalidStateTransitionError);

    // Cannot fail a SUBMITTED attempt directly without entering EVALUATING
    const submittedAttempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'SUBMITTED',
    });
    expect(() => submittedAttempt.failEvaluation('err')).toThrow(InvalidStateTransitionError);

    // Cannot complete an already COMPLETED attempt
    const completedAttempt = new Attempt({
      problemId: '507f1f77bcf86cd799439011',
      learnerId: 'demo-user',
      status: 'COMPLETED',
    });
    expect(() => completedAttempt.completeEvaluation()).toThrow(InvalidStateTransitionError);

    // Cannot retry a non-FAILED attempt
    expect(() => draftAttempt.resetForRetry()).toThrow(InvalidStateTransitionError);
  });
});