import { GoogleGenerativeAI } from '@google/generative-ai';
import { Problem } from '../../domain/entities/Problem.js';
import { Submission } from '../../domain/entities/Submission.js';
import { Evaluation } from '../../domain/entities/Evaluation.js';
import { Evaluator } from '../../domain/interfaces/Evaluator.js';
import { buildRubricPrompt } from './rubricPrompt.js';
import { EvaluationOutputSchema } from '../../validators/evaluationValidator.js';

export class AIEvaluator implements Evaluator {
  private apiKey: string;
  private modelName: string;

  constructor(apiKey?: string, modelName = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
    this.modelName = modelName;
  }

  async evaluate(problem: Problem, submission: Submission): Promise<Evaluation> {
    if (!this.apiKey) {
      throw new Error('AI API key is missing. Set AI_API_KEY in environment variables.');
    }

    const prompt = buildRubricPrompt(problem, submission);

    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();

      // Clean markdown code blocks if present
      const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr: any) {
        throw new Error(`AI returned malformed JSON: ${parseErr.message}`);
      }

      // Validate against strict rubric schema
      const validated = EvaluationOutputSchema.parse(parsed);

      return new Evaluation({
        attemptId: submission.attemptId,
        status: 'COMPLETED',
        overallSummary: validated.overallSummary,
        criteria: validated.criteria,
        strengths: validated.strengths,
        improvements: validated.improvements,
      });
    } catch (err: any) {
      console.error('AI Evaluation error:', err);
      throw new Error(`AI evaluation failed: ${err.message}`);
    }
  }
}
