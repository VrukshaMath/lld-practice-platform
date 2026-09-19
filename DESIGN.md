# Architecture & Design Specification — LLD Practice Platform

## 1. Product Goal

The **LLD Practice Platform** is a specialized developer tool designed to bridge the gap between theoretical Object-Oriented Design (OOD) knowledge and interview-grade Low-Level Design execution. It provides a structured practice environment where learners design solutions to real-world domain problems, receive evidence-backed, actionable feedback across a standardized 8-criterion rubric, and iterate across successive attempts.

---

## 2. User Flow

```
┌──────────────────┐
│  Choose Problem  │ (Parking Lot, Vending Machine, Elevator System)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Start Attempt   │ (Instantiates Attempt in DRAFT status)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Structured Form  │ (6 Sections: Assumptions, Classes, Relationships,
└────────┬─────────┘  Abstractions, Design Decisions, Edge Cases)
         │
         ▼
┌──────────────────┐
│ Submit Solution  │ (Validates input, persists Submission, transitions to SUBMITTED)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Async Evaluation │ (Transitions to EVALUATING, calls Evaluator abstraction)
└────────┬─────────┘
         │
   ┌─────┴──────────────────┐
   │ Success                │ Failure
   ▼                        ▼
┌──────────────────┐   ┌──────────────────────────┐
│ COMPLETED State  │   │ FAILED State             │
│ (Store Rubric)   │   │ (Preserve Submission,    │
└────────┬─────────┘   │  Allow Evaluation Retry) │
         │             └────────────┬─────────────┘
         ▼                          │
┌──────────────────┐                │
│ Review Feedback  │                │
│ (8 Rubric Cards, │                │
│  Strengths &     │                │
│  Improvements)   │                │
└────────┬─────────┘                │
         │                          │
         ▼                          ▼
┌──────────────────┐   ┌──────────────────────────┐
│    Try Again     │   │     Retry Evaluation     │
│ (New Attempt #2) │   │ (Re-runs AI evaluation)  │
└──────────────────┘   └──────────────────────────┘
```

---

## 3. Domain Model

The core domain model is decoupled from the database and HTTP transport layers:

```
┌────────────────────────────────────────────────────────────┐
│                        Problem                             │
│  - id, slug, title, description, difficulty                │
│  - concepts[], requirements[], evaluationFocus[]           │
└─────────────────────────────┬──────────────────────────────┘
                              │ 1
                              │
                              │ *
┌─────────────────────────────▼──────────────────────────────┐
│                        Attempt                             │
│  - id, problemId, learnerId, status                        │
│  - submittedAt, evaluationStartedAt, evaluationCompletedAt │
│  - evaluationError                                         │
│  --------------------------------------------------------- │
│  + submit()                                                │
│  + startEvaluation()                                       │
│  + completeEvaluation()                                    │
│  + failEvaluation(error)                                   │
│  + resetForRetry()                                         │
└──────────────┬──────────────────────────────┬──────────────┘
               │ 1                            │ 1
               │                              │
               │ 1                            │ 1
┌──────────────▼─────────────┐ ┌──────────────▼──────────────┐
│        Submission          │ │         Evaluation          │
│  - id, attemptId           │ │  - id, attemptId, status    │
│  - assumptions, classes    │ │  - overallSummary           │
│  - relationships           │ │  - criteria[]               │
│  - abstractions            │ │  - strengths[], improvements│
│  - designDecisions         │ │  -------------------------- │
│  - edgeCases               │ │  + getAverageScore(): number│
│  ------------------------- │ └─────────────────────────────┘
│  + isComplete(): boolean   │
└────────────────────────────┘
```

### Entities & Responsibilities:
1. **`Problem`**: Represents an invariant specification of an LLD problem. Owns the title, difficulty level, list of functional requirements, architectural concepts, and key evaluation focus points.
2. **`Attempt`**: Represents a learner's iterative engagement with a problem. Owns the lifecycle state machine and timestamps. Enforces valid state transitions internally rather than delegating validation to controllers.
3. **`Submission`**: Represents the concrete artifact authored by the learner. Owns the structured design content across the 6 core pillars. Contains `isComplete()` to determine whether minimum semantic criteria have been satisfied.
4. **`Evaluation`**: Represents the assessment report. Owns the overall summary, the collection of evaluated criteria, identified strengths, recommended improvements, and computes `getAverageScore()`.
5. **`Evaluator` (Abstraction)**: The architectural port defining `evaluate(problem: Problem, submission: Submission): Promise<Evaluation>`.

---

## 4. Attempt State Machine

The `Attempt` entity encapsulates a strict finite state machine:

```
   [ DRAFT ]
       │
       │ submit()
       ▼
 [ SUBMITTED ]
       │
       │ startEvaluation()
       ▼
 [ EVALUATING ]
       ├─── completeEvaluation() ───► [ COMPLETED ]
       │
       └─── failEvaluation(error) ──► [ FAILED ]
                                          │
                                          │ resetForRetry()
                                          ▼
                                    [ SUBMITTED ]
```

### Invariants & Transition Guards:
- **DRAFT → SUBMITTED**: Permitted only when `status === 'DRAFT'`. Re-submitting an already submitted attempt throws an `InvalidStateTransitionError`.
- **SUBMITTED → EVALUATING**: Permitted only when `status === 'SUBMITTED'`. Attempting to evaluate an unsubmitted draft throws an `InvalidStateTransitionError`.
- **EVALUATING → COMPLETED**: Permitted only when `status === 'EVALUATING'`. Cannot complete an attempt that is not actively evaluating.
- **EVALUATING → FAILED**: Permitted only when `status === 'EVALUATING'`. Preserves error context and completion timestamp.
- **FAILED → SUBMITTED (Retry)**: Permitted only when `status === 'FAILED'`. Allows resetting the attempt so evaluation can be retried without losing the learner's original submission.

---

## 5. Evaluation Architecture: Deterministic Checks vs. AI Judgment

To maximize reliability and minimize wasteful LLM invocation, evaluation is partitioned into two distinct stages:

```
                          Incoming Submission
                                   │
                                   ▼
          ┌─────────────────────────────────────────────────┐
          │         Stage 1: Deterministic Checks           │
          │  - Zod request body validation                  │
          │  - Non-empty section guards (isComplete)        │
          │  - Minimum character count verification         │
          │  - Attempt state guard (must be DRAFT)          │
          │  - Duplicate submission rejection               │
          └────────────────────────┬────────────────────────┘
                                   │ PASS
                                   ▼
          ┌─────────────────────────────────────────────────┐
          │         Stage 2: AI Judgment Engine             │
          │  - 8-Criterion Fixed Rubric                     │
          │  - Requirement Understanding                    │
          │  - Class Responsibilities & Single Responsibility│
          │  - Encapsulation & Information Hiding           │
          │  - Coupling & Cohesion                          │
          │  - Abstraction & Interfaces                     │
          │  - Extensibility (Open-Closed Principle)        │
          │  - Edge Cases & Concurrency                     │
          │  - Architectural Trade-off Reasoning            │
          │  - Structured JSON Output Validation            │
          └─────────────────────────────────────────────────┘
```

Deterministic checks catch missing inputs, formatting errors, and illegal state transitions immediately with HTTP 400 responses. AI judgment is reserved exclusively for subjective architectural trade-offs and structural cohesion analysis.

---

## 6. Evaluator Abstraction

The core system depends strictly on the `Evaluator` interface:

```typescript
export interface Evaluator {
  evaluate(problem: Problem, submission: Submission): Promise<Evaluation>;
}
```

### Architectural Benefits:
- **Dependency Inversion**: Neither controllers nor application services (`EvaluationService`, `PracticeService`) have any direct coupling to `@google/generative-ai`, OpenAI, or Anthropic SDKs.
- **Pluggable Strategies**:
  ```
  Evaluator (Interface)
     ├── AIEvaluator (Google Gemini API / OpenAI)
     ├── MockEvaluator (Deterministic heuristic evaluator for offline execution & tests)
     ├── RuleBasedEvaluator (Future static AST/regex analyzer)
     └── HumanEvaluator (Future mentor review workflow)
  ```
- **Resilience**: In development or test environments where no external AI API key is provisioned, `EvaluatorFactory` automatically injects `MockEvaluator`. The entire learner journey works 100% locally out of the box.

---

## 7. Change Test Analysis

### Change Test A — Submission Format Extensibility
*Current*: Structured text submission (`Submission` with 6 sections).
*Future Need*: Support `TextSubmission`, `DiagramSubmission` (e.g. Mermaid or PlantUML), and `CodeSubmission` (e.g. Java/TypeScript classes).

**Architectural Support**:
- `Attempt` only maintains an `id` reference to a `Submission` and does not embed submission properties directly.
- The `SubmissionRepository` interface abstracts storage operations. Adding a `DiagramSubmission` requires defining a new submission entity that adheres to a base `BaseSubmission` contract (`isComplete()`, `attemptId`).
- `Attempt` state transitions and the practice flow remain completely unaffected.

### Change Test B — Evaluation Method Extensibility
*Current*: `AIEvaluator` using Google Gemini.
*Future Need*: Support `RuleBasedEvaluator` and `HumanEvaluator`.

**Architectural Support**:
- `EvaluationService` receives `Evaluator` via constructor dependency injection.
- Replacing the evaluation mechanism requires zero modifications to `EvaluationService`, `Attempt`, or the database schemas. A new class `RuleBasedEvaluator implements Evaluator` or `HumanEvaluator implements Evaluator` can be swapped via `EvaluatorFactory` or an evaluation strategy configuration flag.

---

## 8. Failure Handling & Data Preservation Guarantee

A foundational principle of the platform is that **a learner's intellectual effort must never be lost due to upstream AI provider failures**.

### Failure Sequence:
1. When the learner clicks **Submit Solution**, the `Submission` document is saved to MongoDB **before** evaluation is invoked.
2. The `Attempt` state is transitioned to `SUBMITTED`.
3. Background evaluation starts, transitioning the status to `EVALUATING`.
4. If the AI provider times out, encounters a rate limit, or returns invalid JSON:
   - The error is caught by `EvaluationService`.
   - The `Attempt` transitions to `FAILED`, and the error string is persisted.
   - An `Evaluation` record with `status: 'FAILED'` is stored.
   - The `Submission` entity remains untouched and fully accessible in MongoDB.
5. In the UI, the learner is presented with:
   - "Evaluation failed, but your submission is safe."
   - A button to inspect their preserved text.
   - A **Retry Evaluation** button that re-triggers evaluation without requiring re-entry.

---

## 9. Architectural Trade-offs

| Decision | Alternative Considered | Rationale for MVP Choice |
| :--- | :--- | :--- |
| **Monolith Architecture** | Microservices (Evaluation Worker + API Gateway) | A simple Express/Node monolith eliminates network serialization overhead, message broker dependencies (Kafka/RabbitMQ), and operational complexity while easily supporting the prototype's requirements. |
| **Structured Text** | Drag-and-drop UML Editor / Code Sandbox | Building a UML editor consumes excessive frontend effort without improving LLD practice fidelity. Structured text forces the learner to articulate design rationale and keeps the scope manageable. |
| **LLM Rubric Evaluation** | Purely deterministic AST linting | LLD is fundamentally about domain modeling and trade-offs, which cannot be captured by static syntax linters alone. The LLM provides contextual reasoning when bound by a strict rubric. |
| **Fixed 8-Criterion Rubric** | Open-ended prompt ("Is this design good?") | Open-ended prompts generate vague, inconsistent feedback. The fixed rubric guarantees concrete evidence citations, explicit concerns, and actionable suggestions. |
| **No Authentication** | Full OAuth / JWT Auth | Authentication adds boilerplate (tokens, sessions, password reset) that does not contribute to evaluating the core LLD domain model. Using `demo-user` is a deliberate MVP scoping choice. |
| **HTTP Polling** | WebSockets / Server-Sent Events | Polling every 2 seconds is trivial to implement, resilient against connection drops, and requires zero stateful socket infrastructure on the server. |

---

## 10. Future Evolution

1. **Multi-Modal Submissions**: Integration of text-based diagram syntax (Mermaid.js) with instant visual preview alongside structured text.
2. **Deterministic Code Linting**: Combining static AST analysis (checking class inheritance depth, interface implementation, access modifier encapsulation) with LLM architectural reasoning.
3. **Human Mentor Review**: A workflow enabling senior software architects to review AI-generated evaluations, adjust rubric scores, and add personalized mentorship notes.
4. **Cohort Analytics & Heatmaps**: Visual analytics tracking which LLD criteria learners struggle with most across multiple attempts (e.g., Coupling vs. Extensibility).
5. **Interview Simulation Mode**: Adding a 40-minute countdown timer and dynamic requirement changes mid-attempt (e.g., "Requirement Change: Support electric charging stations").