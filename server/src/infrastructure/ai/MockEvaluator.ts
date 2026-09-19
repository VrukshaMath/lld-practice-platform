import { Problem } from '../../domain/entities/Problem.js';
import { Submission } from '../../domain/entities/Submission.js';
import { Evaluation, CriterionEvaluation } from '../../domain/entities/Evaluation.js';
import { Evaluator } from '../../domain/interfaces/Evaluator.js';

export class MockEvaluator implements Evaluator {
  private shouldSimulateFailure: boolean;

  constructor(shouldSimulateFailure = false) {
    this.shouldSimulateFailure = shouldSimulateFailure;
  }

  public setSimulateFailure(fail: boolean) {
    this.shouldSimulateFailure = fail;
  }

  async evaluate(problem: Problem, submission: Submission): Promise<Evaluation> {
    if (this.shouldSimulateFailure) {
      throw new Error('Simulated AI provider failure: Rate limit or upstream timeout.');
    }

    // Heuristic analysis of the submission to extract realistic evidence and scores
    const classesText = submission.classes || '';
    const abstractionsText = submission.abstractions || '';
    const decisionsText = submission.designDecisions || '';
    const edgeCasesText = submission.edgeCases || '';
    const assumptionsText = submission.assumptions || '';

    const hasStrategyPattern =
      /strategy/i.test(abstractionsText) ||
      /strategy/i.test(classesText) ||
      /strategy/i.test(decisionsText);

    const hasStatePattern =
      /state/i.test(abstractionsText) ||
      /state/i.test(classesText) ||
      /state/i.test(decisionsText);

    const hasClearInterfaces =
      /interface/i.test(abstractionsText) ||
      /abstract/i.test(abstractionsText) ||
      /implements/i.test(classesText);

    const edgeCaseCount = edgeCasesText
      .split('\n')
      .filter((line) => line.trim().length > 5).length;

    // Build criteria
    const criteria: CriterionEvaluation[] = [
      {
        criterion: 'Requirement Understanding',
        score: assumptionsText.length > 50 ? 4 : 3,
        evidence: `Assumptions specified: "${assumptionsText.slice(0, 100).replace(/\n/g, ' ')}..."`,
        concern:
          assumptionsText.length > 50
            ? 'None'
            : 'Assumptions are brief; consider clarifying scale and concurrency bounds.',
        suggestion:
          'State throughput expectations, concurrency requirements, and hardware failure modes explicitly.',
        confidence: 0.94,
      },
      {
        criterion: 'Class Responsibilities',
        score: classesText.includes('Manager') || classesText.includes('Service') ? 4 : 3,
        evidence: `Core classes declared: "${classesText.slice(0, 120).replace(/\n/g, ' ')}..."`,
        concern:
          classesText.length < 150
            ? 'Some classes may carry multiple responsibilities (e.g. data holding and coordination).'
            : 'None',
        suggestion:
          'Ensure coordinator classes delegate domain computations to dedicated strategy or calculator classes.',
        confidence: 0.91,
      },
      {
        criterion: 'Encapsulation',
        score: 4,
        evidence: `Data and method boundaries defined in classes: "${classesText.slice(0, 80).replace(/\n/g, ' ')}..."`,
        concern: 'Ensure internal collection states are returned as immutable/defensive copies.',
        suggestion:
          'Expose accessor methods or event hooks rather than directly revealing internal collections.',
        confidence: 0.89,
      },
      {
        criterion: 'Coupling and Cohesion',
        score: hasClearInterfaces ? 4 : 3,
        evidence: hasClearInterfaces
          ? `Interfaces defined to decouple modules: "${abstractionsText.slice(0, 90).replace(/\n/g, ' ')}..."`
          : 'High coupling detected between direct class references without abstraction boundaries.',
        concern: hasClearInterfaces
          ? 'Verify that callers depend strictly on abstractions rather than concrete implementations.'
          : 'Classes instantiate concrete dependencies directly rather than relying on dependency injection or factories.',
        suggestion:
          'Introduce factory or builder patterns to isolate instantiation of concrete components.',
        confidence: 0.9,
      },
      {
        criterion: 'Abstraction and Interfaces',
        score: hasClearInterfaces ? 4 : 3,
        evidence: `Abstractions documented: "${abstractionsText.slice(0, 100).replace(/\n/g, ' ')}..."`,
        concern: hasClearInterfaces
          ? 'None'
          : 'Lack of explicit interfaces will hinder polymorphism and testability.',
        suggestion:
          'Define explicit interfaces for core behaviors (e.g., pricing, dispatching, state handling).',
        confidence: 0.93,
      },
      {
        criterion: 'Extensibility',
        score: hasStrategyPattern || hasStatePattern ? 5 : 3,
        evidence:
          hasStrategyPattern || hasStatePattern
            ? 'Design leverages standard design patterns (Strategy/State) for polymorphic behavior.'
            : 'Adding new rules or entities may require modifying existing switch/if-else blocks.',
        concern:
          hasStrategyPattern || hasStatePattern
            ? 'None'
            : 'Violates Open-Closed Principle if new types require modifying existing controllers.',
        suggestion:
          'Extract varying algorithms behind strategy interfaces so new types can be added without modifying existing code.',
        confidence: 0.92,
      },
      {
        criterion: 'Edge Cases',
        score: edgeCaseCount >= 3 ? 4 : 3,
        evidence: `Edge cases documented (${edgeCaseCount} found): "${edgeCasesText.slice(0, 100).replace(/\n/g, ' ')}..."`,
        concern:
          edgeCaseCount >= 3
            ? 'Verify race conditions when concurrent requests target the same resource.'
            : 'Only a few edge cases were enumerated; concurrency and full-capacity situations need deeper treatment.',
        suggestion:
          'Address race conditions, timeouts, invalid state transitions, and out-of-order requests explicitly.',
        confidence: 0.88,
      },
      {
        criterion: 'Design Reasoning',
        score: decisionsText.length > 50 ? 4 : 3,
        evidence: `Trade-offs articulated: "${decisionsText.slice(0, 110).replace(/\n/g, ' ')}..."`,
        concern:
          decisionsText.length > 50
            ? 'None'
            : 'Trade-offs between simplicity and extensibility are not fully explored.',
        suggestion:
          'Explain why specific design patterns were preferred over simpler alternatives and discuss memory vs runtime trade-offs.',
        confidence: 0.91,
      },
    ];

    const strengths = [
      `Clear decomposition of domain entities aligned with ${problem.title} requirements.`,
      hasClearInterfaces
        ? 'Well-defined abstraction contracts allowing polymorphic implementations.'
        : 'Good structural separation across model responsibilities.',
    ];

    const improvements = [
      'Detail concurrency handling and synchronization mechanisms for shared state.',
      'Explicitly formalize error states and recovery flows in the class contracts.',
    ];

    return new Evaluation({
      attemptId: submission.attemptId,
      status: 'COMPLETED',
      overallSummary: `Solid object-oriented design for ${problem.title}. The solution demonstrates clear entity modeling, thoughtful section breakdown, and extensible abstractions. Key opportunities for refinement involve concurrency safety and defensive encapsulation.`,
      criteria,
      strengths,
      improvements,
    });
  }
}
