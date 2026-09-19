# AI-Assisted Development Log — LLD Practice Platform

This document records the meaningful architectural and technical decisions made in collaboration with AI during the design and implementation of the LLD Practice Platform.

---

## Decision 1 — Evaluation Rubric Design

### AI Suggestion
The AI assistant initially proposed using an open-ended prompt asking the model to provide general architectural feedback and assign a single score out of 100 points, loosely checking if the learner followed SOLID principles and design patterns.

### Decision
**Rejected** the single 100-point score and open-ended prompt; **Accepted** a strict, multi-dimensional 8-criterion rubric scored 0–5.

### Why
A single numeric score out of 100 is subjective and unexplainable in object-oriented design. In real LLD interviews, candidates are evaluated across specific competencies (class boundaries, encapsulation, coupling, extensibility). By restricting the evaluation to 8 explicit criteria (Requirement Understanding, Class Responsibilities, Encapsulation, Coupling & Cohesion, Abstraction & Interfaces, Extensibility, Edge Cases, Design Reasoning) and requiring every concern to cite concrete evidence from the submission, feedback remains grounded, verifiable, and actionable.

---

## Decision 2 — Evaluator Abstraction & Offline Resilience

### AI Suggestion
The AI assistant initially considered calling the Google Gemini SDK directly inside the Express controller or the `EvaluationService` to minimize file count and indirection.

### Decision
**Rejected** direct SDK calls; **Accepted** isolating the evaluation engine behind a domain interface (`Evaluator`), accompanied by an `EvaluatorFactory` supplying both `AIEvaluator` and a deterministic `MockEvaluator`.

### Why
Directly embedding the AI provider in controllers creates tight coupling and violates Dependency Inversion. More importantly, it creates an operational failure mode where anyone running or grading the project without a provisioned Google Gemini API key would face broken flows. The `Evaluator` abstraction allows swapping providers (`AIEvaluator`, `OpenAIEvaluator`, `RuleBasedEvaluator`) seamlessly and allows unit tests and local demos to run 100% offline via `MockEvaluator`.

---

## Decision 3 — Submission Format (Structured Text vs. UML Drawing Canvas)

### AI Suggestion
During early discussions on submission UI, the AI proposed integrating a third-party canvas or React diagramming library (e.g. React Flow) to let learners visually link class boxes.

### Decision
**Rejected** the visual UML canvas; **Accepted** a structured text submission divided into 6 explicit sections (Assumptions, Classes & Responsibilities, Relationships, Interfaces / Abstractions, Design Decisions & Trade-offs, Edge Cases).

### Why
Visual diagramming tools in web prototypes introduce high UX friction, fragile dragging interactions, and complex serialization formats. More critically, diagram tools fail to capture *why* a design decision was made. Structured text forces the learner to articulate class responsibilities, relationship types, and trade-offs directly, which provides richer evidence for architectural critique. Furthermore, keeping `Submission` separate from `Attempt` satisfies Change Test A, ensuring diagram or code submissions can be added in the future without modifying attempt workflows.

---

## Decision 4 — Data Preservation and Asynchronous Failure Handling

### AI Suggestion
The AI initially drafted a synchronous request flow: the client calls `POST /api/attempts/:id/submit`, the server calls the AI model in the same HTTP request handler, and returns the evaluation response immediately or throws an HTTP 500 on failure.

### Decision
**Rejected** synchronous execution; **Accepted** a two-stage asynchronous flow where the submission is persisted in MongoDB *before* evaluation begins, followed by background evaluation and frontend polling.

### Why
Synchronous LLM evaluation holds HTTP socket connections open for 5–15 seconds, risking gateway timeouts and dropped requests. Even worse, if the LLM call failed or hit a rate limit, the client would receive an error and the learner would lose their entire solution. In our asynchronous architecture, the `Submission` is saved first, transitioning the attempt to `SUBMITTED`. If the AI fails, the attempt transitions to `FAILED`, the submission remains safely in the database, and the learner can click "Retry Evaluation" without re-entering their work.

---

## Decision 5 — Multi-Design Evaluation vs. Canonical Reference Matching

### AI Suggestion
The AI suggested seeding reference solutions for each problem (e.g., standard Parking Lot class hierarchy) and passing that reference solution into the prompt so the model could compare learner answers against the "correct" implementation.

### Decision
**Strictly Rejected** reference solution comparison; **Accepted** a prompt architecture that explicitly instructs the model that multiple valid designs exist and forbids penalizing learners for choosing alternative valid patterns.

### Why
In Low-Level Design, comparing against a single canonical implementation is fundamentally flawed. A learner who implements spot allocation using a `Strategy` pattern should not be penalized if the reference solution used a `PriorityQueue`, provided their responsibilities and abstractions are cohesive. The AI prompt was specifically engineered to evaluate whether the learner's design satisfies requirements, encapsulates state, and handles edge cases, rather than comparing against a rigid template.