import { Evaluator } from '../../domain/interfaces/Evaluator.js';
import { AIEvaluator } from './AIEvaluator.js';
import { MockEvaluator } from './MockEvaluator.js';

export class EvaluatorFactory {
  private static mockInstance: MockEvaluator | null = null;
  private static simulateFailureMode = false;

  public static setSimulateFailure(fail: boolean): void {
    this.simulateFailureMode = fail;
    if (this.mockInstance) {
      this.mockInstance.setSimulateFailure(fail);
    }
  }

  public static getSimulateFailure(): boolean {
    return this.simulateFailureMode;
  }

  public static createEvaluator(): Evaluator {
    const provider = process.env.AI_PROVIDER?.toLowerCase();
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    if (this.simulateFailureMode) {
      return new MockEvaluator(true);
    }

    if (provider === 'mock' || !apiKey) {
      if (!this.mockInstance) {
        this.mockInstance = new MockEvaluator(this.simulateFailureMode);
      }
      return this.mockInstance;
    }

    return new AIEvaluator(apiKey);
  }
}
