LLD Practice — Low-Level Design Practice Platform
A focused practice platform that helps software engineers practice Low-Level Design (LLD) and Object-Oriented Design (OOD), submit structured solutions, receive evidence-based and explainable rubric feedback, review attempt history, and iterate with repeated attempts.

1. Problem Being Solved
In software engineering interviews and real-world system design, Low-Level Design (LLD) evaluates how engineers translate business requirements into modular, cohesive, and extensible object-oriented models.

Most existing resources suffer from significant limitations:

No Interactive Feedback: Platforms like Educative or static GitHub repositories provide reference solutions, leaving learners to guess whether their alternative design is valid.
Premature Coding: Machine-coding practice sites (e.g. workat.tech) force learners to immediately write hundreds of lines of boilerplate code in timed settings before verifying their domain abstractions and class responsibilities.
Rigid Reference Comparison: Traditional evaluation assumes a single "correct" answer, penalizing valid architectural design patterns.
LLD Practice bridges this gap with an asynchronous, evidence-based feedback loop: Choose Problem → Start Attempt → Structure Design → Submit → Evaluate (8 Rubric Criteria) → Receive Explainable Feedback → Review History → Try Again.

2. Core Features
Initial Problems:
Parking Lot (Easy): Multi-floor facility, spot allocation, vehicle hierarchy, fee strategy.
Vending Machine (Medium): State pattern transitions, product inventory, payment abstractions.
Elevator System (Medium): Dispatcher strategy, request management, elevator states.
Structured 6-Section Submission:
Assumptions & Scope Boundaries
Classes & Responsibilities
Relationships (Inheritance, Composition, Association)
Interfaces / Abstractions
Design Decisions & Architectural Trade-offs
Edge Cases & Concurrency Handling
Attempt State Machine:
Enforces DRAFT → SUBMITTED → EVALUATING → COMPLETED / FAILED.
Domain-level transition guards throwing InvalidStateTransitionError on illegal actions.
Evaluator Abstraction & Zero-Friction Setup:
Decouples AI judgment behind the Evaluator domain interface.
Supports AIEvaluator (Google Gemini) and MockEvaluator (heuristic rule-based analyzer for offline/keyless development).
Asynchronous Safe Evaluation:
Submissions are persisted in MongoDB before evaluation starts.
If upstream evaluation fails, the attempt is marked FAILED, the learner's submission is preserved, and a Retry Evaluation option is provided.
Explainable Rubric Feedback:
8 distinct criteria scored 0–5: Requirement Understanding, Class Responsibilities, Encapsulation, Coupling & Cohesion, Abstraction & Interfaces, Extensibility, Edge Cases, and Design Reasoning.
Cites concrete textual evidence from the submission, architectural concerns, actionable suggestions, and confidence scores.
Highlights "What you did well" (strengths) and "Next attempt" (improvements).
Non-Destructive Iteration:
Clicking "Try Again" instantiates a new attempt, preserving all previous attempts in history.
3. Tech Stack
Frontend:
React 18
TypeScript
Vite
Tailwind CSS
React Router DOM v6
Lucide React
Backend:
Node.js (v22+)
Express
TypeScript
Mongoose / MongoDB (with auto-fallback to mongodb-memory-server)
Zod (request body validation and AI output validation)
Testing:
Vitest
Supertest
4. Folder Structure

lld-practice-platform/
├── client/                     # Vite + React + Tailwind frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (ProblemCard, RubricCard, StatusBadge, etc.)
│   │   ├── pages/              # 5 Core pages (Home, Problem, Practice, Feedback, History)
│   │   ├── services/           # API client (fetch wrapper)
│   │   ├── types/              # Frontend TypeScript contracts
│   │   ├── App.tsx             # Route definitions
│   │   ├── index.css           # Tailwind base styles
│   │   └── main.tsx            # React DOM root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── domain/             # Core Domain Layer
│   │   │   ├── entities/       # Problem, Attempt (State Machine), Submission, Evaluation
│   │   │   ├── errors/         # DomainError, InvalidStateTransitionError, NotFoundError, ValidationError
│   │   │   └── interfaces/     # Evaluator, ProblemRepository, AttemptRepository, etc.
│   │   ├── application/        # Application Services (PracticeService, EvaluationService)
│   │   ├── infrastructure/     # Database and AI infrastructure
│   │   │   ├── database/       # Mongoose schemas, connection, and repository implementations
│   │   │   └── ai/             # EvaluatorFactory, AIEvaluator, MockEvaluator, rubric prompt
│   │   ├── controllers/        # Thin HTTP controllers (ProblemController, AttemptController)
│   │   ├── routes/             # Express routes (/api/problems, /api/attempts)
│   │   ├── validators/         # Zod schemas for submissions and AI response
│   │   ├── middleware/         # Central error handling middleware
│   │   ├── seed/               # Dataset for the 3 problems and seed runner
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # Server entry point
│   ├── tests/                  # Vitest test suite
│   │   ├── domain/             # State machine & submission entity tests
│   │   ├── application/        # Evaluation service resilience & retry tests
│   │   └── api/                # Supertest REST API integration tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── README.md                   # Setup guide and technical overview
├── RESEARCH.md                 # Real-world research note and competitive analysis
├── DESIGN.md                   # Full architecture and domain design specification
├── AI_USAGE.md                 # Log of AI-assisted engineering decisions
├── .env.example                # Sample environment configuration
└── package.json                # Root orchestration package.json
5. Setup & Running Instructions
Prerequisites
Node.js (v18 or higher recommended; developed on Node v22)
npm (v9+)
(Optional) MongoDB instance (if not provided, an in-memory MongoDB will automatically start)
1. Environment Configuration
Copy .env.example in the root (or configure server/.env):

bash

# Optional: defaults to local MongoDB or automatic in-memory fallback
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lld-practice
# Optional: Google Gemini API Key
# If omitted, MockEvaluator is automatically selected for zero-config offline execution
AI_API_KEY=
AI_PROVIDER=gemini
# Frontend environment
VITE_API_URL=http://localhost:5000/api
2. Install Dependencies
Install server and client packages:

bash

# Server dependencies
cd server
npm install
# Client dependencies
cd ../client
npm install
3. Seed Database
Populate the database with the 3 initial problems:

bash

cd ../server
npm run seed
4. Running the Application
Option A: Run Backend & Frontend concurrently from root

bash

npm run dev
Option B: Run independently

bash

# Terminal 1 - Backend Server (runs on http://localhost:5000)
cd server
npm run dev
# Terminal 2 - Frontend Client (runs on http://localhost:5173)
cd client
npm run dev
Open http://localhost:5173 in your browser to start practicing.

6. Running Tests
Run the complete Vitest test suite across domain entities, application services, and REST APIs:

bash

cd server
npm test
Test coverage includes:

Attempt State Machine: Draft submissions, double-submit guards, transition to evaluating, draft evaluation rejection, completion, failure, and illegal transition exceptions.
Submission Entity: Deterministic completeness validation (isComplete()).
Evaluation Service: Persistence of evaluation, state transition to completed, AI provider failure recovery, submission data preservation, and evaluation retry.
REST API: GET problems, POST attempt creation, POST submission, GET attempt history, GET evaluation, and validation error status codes.
7. AI Evaluation Configuration
With Gemini API Key: Set AI_API_KEY=your_gemini_key in server/.env. The platform will invoke AIEvaluator using Gemini 1.5 Flash with strict JSON schema validation.
Without API Key (Offline Mock Engine): Leave AI_API_KEY empty or set AI_PROVIDER=mock. The platform automatically engages MockEvaluator, which performs heuristic structural parsing of the 6 submission sections to generate realistic, evidence-based rubric feedback.
8. REST API Overview
Method	Endpoint	Description	Request Body
GET	/api/problems	List problems with attempt counts	-
GET	/api/problems/:id	Get problem by ID or slug	-
POST	/api/attempts	Create a new draft attempt	{ "problemId": "..." }
GET	/api/attempts	Get attempt history (newest first)	-
GET	/api/attempts/:id	Get attempt, problem, and submission	-
POST	/api/attempts/:id/submit	Submit structured solution	{ "assumptions", "classes", "relationships", "abstractions", "designDecisions", "edgeCases" }
GET	/api/attempts/:id/evaluation	Get rubric evaluation for attempt	-
POST	/api/attempts/:id/evaluate	Retry failed evaluation	-
POST	/api/attempts/simulate-failure	Toggle failure mode (for testing)	{ "fail": true }
9. Key LLD Architecture Decisions
Domain State Machine: Transition logic (submit, startEvaluation, completeEvaluation, failEvaluation, resetForRetry) is encapsulated directly inside the Attempt entity.
Separation of Concerns: Controllers are thin transport mappers; business logic lives in PracticeService and EvaluationService; persistence is isolated in Mongoose repositories.
Extensibility via Interfaces:
Submission Format (Change Test A): Submission is kept distinct from Attempt, allowing future additions like DiagramSubmission or CodeSubmission.
Evaluation Engine (Change Test B): The system depends exclusively on Evaluator, allowing new evaluators (RuleBasedEvaluator, HumanEvaluator) to be introduced without modifying domain or application code.
10. Known Limitations
Authentication is intentionally omitted; learners are identified by learnerId = "demo-user".
Submission format is structured text rather than a visual UML drag-and-drop canvas or code sandbox.
Monolithic architecture with background asynchronous execution and frontend HTTP polling rather than distributed message brokers (Kafka/RabbitMQ) or WebSockets.
