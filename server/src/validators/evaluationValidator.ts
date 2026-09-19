import { z } from 'zod';

export const CriterionEvaluationSchema = z.object({
  criterion: z.string().min(1, 'Criterion name is required'),
  score: z.number().min(0).max(5),
  evidence: z.string().default(''),
  concern: z.string().default(''),
  suggestion: z.string().default(''),
  confidence: z.number().min(0).max(1).default(1),
});

export const EvaluationOutputSchema = z.object({
  overallSummary: z.string().min(1, 'Overall summary is required'),
  criteria: z.array(CriterionEvaluationSchema).min(1, 'At least one criterion evaluation is required'),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

export type ValidatedEvaluationOutput = z.infer<typeof EvaluationOutputSchema>;
