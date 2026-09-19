export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type AttemptStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  concepts: string[];
  requirements: string[];
  evaluationFocus: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProblemWithCount {
  problem: Problem;
  attemptCount: number;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId: string;
  status: AttemptStatus;
  submittedAt?: string;
  evaluationStartedAt?: string;
  evaluationCompletedAt?: string;
  evaluationError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Submission {
  id?: string;
  attemptId: string;
  assumptions: string;
  classes: string;
  relationships: string;
  abstractions: string;
  designDecisions: string;
  edgeCases: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CriterionEvaluation {
  criterion: string;
  score: number; // 0 to 5
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number; // 0 to 1
}

export interface Evaluation {
  id?: string;
  attemptId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallSummary: string;
  criteria: CriterionEvaluation[];
  strengths: string[];
  improvements: string[];
  averageScore?: number;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttemptDetail {
  attempt: Attempt;
  problem: Problem;
  submission?: Submission | null;
  evaluation?: Evaluation | null;
  attemptNumber?: number;
}
