export type EvaluationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface CriterionEvaluation {
  criterion: string;
  score: number; // 0 to 5
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number; // 0 to 1
}

export interface EvaluationProps {
  id?: string;
  attemptId: string;
  status?: EvaluationStatus;
  overallSummary?: string;
  criteria?: CriterionEvaluation[];
  strengths?: string[];
  improvements?: string[];
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Evaluation {
  public readonly id?: string;
  public readonly attemptId: string;
  public readonly status: EvaluationStatus;
  public readonly overallSummary: string;
  public readonly criteria: CriterionEvaluation[];
  public readonly strengths: string[];
  public readonly improvements: string[];
  public readonly error?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: EvaluationProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.status = props.status || 'PENDING';
    this.overallSummary = props.overallSummary || '';
    this.criteria = props.criteria || [];
    this.strengths = props.strengths || [];
    this.improvements = props.improvements || [];
    this.error = props.error;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Calculates the average score out of 5 across all rubric criteria.
   * Returns a number between 0 and 5 rounded to one decimal place.
   */
  public getAverageScore(): number {
    if (!this.criteria || this.criteria.length === 0) {
      return 0;
    }

    const totalScore = this.criteria.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    const average = totalScore / this.criteria.length;
    return Math.round(average * 10) / 10;
  }

  public toJSON() {
    return {
      id: this.id,
      attemptId: this.attemptId,
      status: this.status,
      overallSummary: this.overallSummary,
      criteria: this.criteria,
      strengths: this.strengths,
      improvements: this.improvements,
      averageScore: this.getAverageScore(),
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
