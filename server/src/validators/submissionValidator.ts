import { z } from 'zod';

export const SubmissionInputSchema = z.object({
  assumptions: z
    .string({ required_error: 'Assumptions are required' })
    .trim()
    .min(10, 'Assumptions must contain at least 10 characters explaining system bounds'),
  classes: z
    .string({ required_error: 'Classes & Responsibilities are required' })
    .trim()
    .min(15, 'Classes & Responsibilities must contain at least 15 characters detailing core classes'),
  relationships: z
    .string({ required_error: 'Relationships are required' })
    .trim()
    .min(10, 'Relationships must contain at least 10 characters (e.g., composition, inheritance)'),
  abstractions: z
    .string({ required_error: 'Interfaces / Abstractions are required' })
    .trim()
    .min(10, 'Interfaces / Abstractions must contain at least 10 characters'),
  designDecisions: z
    .string({ required_error: 'Design Decisions & Trade-offs are required' })
    .trim()
    .min(10, 'Design Decisions & Trade-offs must contain at least 10 characters'),
  edgeCases: z
    .string({ required_error: 'Edge Cases are required' })
    .trim()
    .min(10, 'Edge Cases must contain at least 10 characters describing boundary conditions'),
});

export type SubmissionInput = z.infer<typeof SubmissionInputSchema>;

export const CreateAttemptSchema = z.object({
  problemId: z.string().min(1, 'problemId is required'),
});
