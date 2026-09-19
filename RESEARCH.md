# Research Note — LLD Practice Platform

## 1. Learner Problem

Low-Level Design (LLD) and Object-Oriented Design (OOD) interview preparation presents a distinct learning bottleneck that standard algorithmic practice (e.g., LeetCode) does not address:

1. **Multiplicity of Valid Solutions**: Unlike Data Structures & Algorithms where an optimal time/space complexity determines correctness, LLD problems have dozens of valid architectural implementations. For example, a Parking Lot system can be designed using Strategy patterns for spot allocation, State patterns for vehicle tracking, or Command patterns for ticket dispensing. Each approach involves distinct trade-offs.
2. **The "Self-Grading" Dilemma**: When learners design a system on paper or in a text editor, they struggle to critically evaluate their own work. They cannot objectively determine whether their classes violate the Single Responsibility Principle, whether their abstractions introduce leaky encapsulation, or if they have overlooked concurrency race conditions.
3. **Reference Solution Inadequacy**: Traditional static textbooks and video tutorials offer a single canonical solution. If a learner designs an alternative model that is equally modular and valid, comparing against a reference solution makes them assume their design is wrong, or fails to explain why their trade-offs differ.
4. **Actionable, Evidence-Based Feedback**: Generic guidance such as "adhere to SOLID principles" or "write clean code" does not teach software architecture. Learners need feedback that references specific classes and relationships from their submission, isolates precise architectural smells, and provides actionable remedies.
5. **Necessity of Repeated Iteration**: Mastery in LLD is cultivated through continuous refinement—identifying a flaw in Attempt #1 (e.g., tight coupling in pricing calculation), redesigning the abstraction in Attempt #2, and observing score and cohesion progression.

---

## 2. Existing Approaches

An examination of existing commercial and open-source LLD interview preparation resources reveals significant structural gaps in interactive feedback:

### 1. Educative.io (*Grokking the Low Level Design Interview Using OOD Principles*)
- **Website**: [https://www.educative.io/courses/grokking-the-low-level-design-interview-using-ood-principles](https://www.educative.io/courses/grokking-the-low-level-design-interview-using-ood-principles)
- **What it provides**: Structured curriculum covering OOP fundamentals, SOLID principles, UML diagrams, and canonical case studies (Parking Lot, Movie Ticket Booking, Amazon Locker).
- **Practice Workflow**: Reading guided chapters and viewing diagrams; occasional embedded coding widgets for skeleton code.
- **Submission Approach**: Self-paced reading; no submission evaluation or open-ended architectural review.
- **Feedback Approach**: Non-existent; the learner compares their thoughts against the author's static solution.
- **Gap Observed**: Purely passive consumption with zero personalized critique or assessment of learner-generated architectures.

### 2. workat.tech (*Machine Coding Practice*)
- **Website**: [https://workat.tech/machine-coding/practice](https://workat.tech/machine-coding/practice)
- **What it provides**: Problem statements for classic machine-coding rounds (e.g., Splitwise, Trello, Parking Lot, Snake & Ladder) with time constraints.
- **Practice Workflow**: Learners read problem requirements, write full code on their local IDEs, and check against editorial code.
- **Submission Approach**: Learners can mark problems as completed or view community solutions.
- **Feedback Approach**: Peer forums or self-review against reference GitHub repositories.
- **Gap Observed**: No automated or rubric-based feedback on object modeling, abstractions, or design patterns prior to full-code implementation.

### 3. Hello Interview (*Low-Level Design & System Design*)
- **Website**: [https://www.hellointerview.com](https://www.hellointerview.com)
- **What it provides**: Deep-dive breakdowns on system design and low-level design patterns with interview rubrics.
- **Practice Workflow**: Framework-driven guides on how to structure a 45-minute interview.
- **Submission Approach**: Manual or mock interviews with peers / paid coaches.
- **Feedback Approach**: Verbal feedback in scheduled 1:1 sessions.
- **Gap Observed**: High scheduling barrier, monetary expense, and lack of an on-demand, instant feedback loop for daily practice.

### 4. Awesome-Low-Level-Design (GitHub Repository by Ashish Pratap Singh)
- **Website**: [https://github.com/ashishps1/awesome-low-level-design](https://github.com/ashishps1/awesome-low-level-design)
- **What it provides**: Curated directory of LLD interview questions, UML class diagrams, and GitHub sample code across Java, C++, and Python.
- **Practice Workflow**: Independent study of reference repositories.
- **Submission Approach**: None.
- **Feedback Approach**: None.
- **Gap Observed**: Serves as a static reference catalog; lacks any mechanism to submit, test, or validate a learner's original design hypothesis.

---

## 3. Identified Gap

The critical missing link in modern software engineering preparation is an **asynchronous, structured feedback loop**:

```
Choose Problem
      │
      ▼
Start Attempt
      │
      ▼
Think & Structure Design (Assumptions, Classes, Abstractions, Trade-offs)
      │
      ▼
Submit Design
      │
      ▼
Instant Evidence-Based Rubric Evaluation
      │
      ▼
Review Strengths & Actionable Refinements
      │
      ▼
Try Again (Track Iteration Progress)
```

Existing tools either provide static reference answers without feedback or jump directly to writing thousands of lines of boilerplate code in timed machine-coding rounds without validating domain models first.

---

## 4. Product Direction

To bridge this gap cleanly and effectively, the **LLD Practice Platform** focuses on:

1. **Structured Text Submissions**: Rather than burdening the learner with clunky drag-and-drop UML drawing tools or requiring full compile-ready code repositories, the platform breaks LLD into its 6 cognitive pillars:
   - Assumptions & Scope Boundaries
   - Classes & Responsibilities
   - Relationships (Composition, Inheritance, Association)
   - Interfaces & Abstractions
   - Design Decisions & Trade-offs
   - Edge Cases & Concurrency
2. **Rubric-Driven Evaluator Abstraction**: Instead of asking an AI "Is this design good?", the platform enforces an 8-criterion objective rubric. Every critique must identify:
   - Evidence cited directly from the learner's text
   - The concrete architectural smell or concern
   - An actionable, prescriptive suggestion
   - Model confidence score
3. **Preserved Iteration History**: The learner can attempt a problem multiple times, view historical feedback, and witness measurable improvements across attempts without losing previous work.

---

## 5. MVP Scope

### Included in MVP:
- Three core LLD problems: **Parking Lot**, **Vending Machine**, and **Elevator System**.
- Structured 6-section submission format with real-time completion counter and validation.
- Attempt domain state machine (`DRAFT` → `SUBMITTED` → `EVALUATING` → `COMPLETED` / `FAILED`).
- `Evaluator` interface isolating AI judgment (`AIEvaluator` using Gemini, and `MockEvaluator` for offline resilience).
- Persistent MongoDB storage preserving submissions prior to evaluation.
- Asynchronous polling UX with live evaluation progress.
- 8-criterion rubric feedback with evidence quotes, concerns, suggestions, strengths, and improvements.
- Attempt history list with chronological numbering, status badges, and rubric average scores.
- Non-destructive "Try Again" flow generating new attempts while preserving past attempts.
- Safe evaluation failure handling with one-click evaluation retry.

### Excluded from MVP (Deliberate Limitations):
- Drag-and-drop UML diagram editor.
- Code execution sandbox / compiler runner.
- User authentication & session management (uses deterministic `demo-user`).
- Distributed queue / microservices infrastructure (simple monolith architecture).
- Community leaderboards and social comments.