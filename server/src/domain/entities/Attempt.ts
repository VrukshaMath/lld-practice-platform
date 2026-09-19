import { InvalidStateTransitionError } from '../errors/DomainErrors.js';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface AttemptProps {
  id?: string;
  problemId: string;
  learnerId: string;
  status?: AttemptStatus;
  submittedAt?: Date;
  evaluationStartedAt?: Date;
  evaluationCompletedAt?: Date;
  evaluationError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Attempt {
  public readonly id?: string;
  public readonly problemId: string;
  public readonly learnerId: string;
  private _status: AttemptStatus;
  private _submittedAt?: Date;
  private _evaluationStartedAt?: Date;
  private _evaluationCompletedAt?: Date;
  private _evaluationError?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: AttemptProps) {
    this.id = props.id;
    this.problemId = props.problemId;
    this.learnerId = props.learnerId || 'demo-user';
    this._status = props.status || 'DRAFT';
    this._submittedAt = props.submittedAt;
    this._evaluationStartedAt = props.evaluationStartedAt;
    this._evaluationCompletedAt = props.evaluationCompletedAt;
    this._evaluationError = props.evaluationError;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public getStatus(): AttemptStatus {
    return this._status;
  }

  public get submittedAt(): Date | undefined {
    return this._submittedAt;
  }

  public get evaluationStartedAt(): Date | undefined {
    return this._evaluationStartedAt;
  }

  public get evaluationCompletedAt(): Date | undefined {
    return this._evaluationCompletedAt;
  }

  public get evaluationError(): string | undefined {
    return this._evaluationError;
  }

  public submit(): void {
    if (this._status !== 'DRAFT') {
      throw new InvalidStateTransitionError(
        this._status,
        'submit',
        'Only draft attempts can be submitted.'
      );
    }
    this._status = 'SUBMITTED';
    this._submittedAt = new Date();
  }

  public startEvaluation(): void {
    if (this._status !== 'SUBMITTED') {
      throw new InvalidStateTransitionError(
        this._status,
        'startEvaluation',
        'Cannot evaluate an attempt unless it has been submitted.'
      );
    }
    this._status = 'EVALUATING';
    this._evaluationStartedAt = new Date();
    this._evaluationError = undefined;
  }

  public completeEvaluation(): void {
    if (this._status !== 'EVALUATING') {
      throw new InvalidStateTransitionError(
        this._status,
        'completeEvaluation',
        'Cannot complete evaluation unless the attempt is currently in EVALUATING state.'
      );
    }
    this._status = 'COMPLETED';
    this._evaluationCompletedAt = new Date();
    this._evaluationError = undefined;
  }

  public failEvaluation(error: string): void {
    if (this._status !== 'EVALUATING') {
      throw new InvalidStateTransitionError(
        this._status,
        'failEvaluation',
        'Cannot mark evaluation as failed unless the attempt is currently in EVALUATING state.'
      );
    }
    this._status = 'FAILED';
    this._evaluationCompletedAt = new Date();
    this._evaluationError = error;
  }

  public resetForRetry(): void {
    if (this._status !== 'FAILED') {
      throw new InvalidStateTransitionError(
        this._status,
        'retryEvaluation',
        'Only failed evaluations can be retried.'
      );
    }
    this._status = 'SUBMITTED';
    this._evaluationError = undefined;
  }

  public toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      learnerId: this.learnerId,
      status: this._status,
      submittedAt: this._submittedAt,
      evaluationStartedAt: this._evaluationStartedAt,
      evaluationCompletedAt: this._evaluationCompletedAt,
      evaluationError: this._evaluationError,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
