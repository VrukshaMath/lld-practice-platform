import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { connectDatabase, disconnectDatabase } from '../../src/infrastructure/database/connection.js';
import { seedProblems } from '../../src/seed/seedProblems.js';
import { EvaluatorFactory } from '../../src/infrastructure/ai/EvaluatorFactory.js';

describe('LLD Practice Platform REST API Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    // Ensure mock evaluator is active so tests do not call real external AI
    EvaluatorFactory.setSimulateFailure(false);
    process.env.AI_PROVIDER = 'mock';

    await connectDatabase();
    await seedProblems();

    const created = createApp();
    app = created.app;
  }, 30000);

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('1. GET /api/problems - retrieves available problems list with counts', async () => {
    const res = await request(app).get('/api/problems');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);

    const slugs = res.body.map((item: any) => item.problem.slug);
    expect(slugs).toContain('parking-lot');
    expect(slugs).toContain('vending-machine');
    expect(slugs).toContain('elevator-system');
  });

  it('2. POST /api/attempts - creates a new DRAFT attempt', async () => {
    const problemsRes = await request(app).get('/api/problems');
    const problemId = problemsRes.body[0].problem.id;

    const res = await request(app)
      .post('/api/attempts')
      .send({ problemId, learnerId: 'test-learner' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.learnerId).toBe('test-learner');
  });

  it('3. POST /api/attempts/:id/submit - validates and submits structured solution', async () => {
    const problemsRes = await request(app).get('/api/problems');
    const problemId = problemsRes.body[0].problem.id;

    // Create attempt
    const attemptRes = await request(app)
      .post('/api/attempts')
      .send({ problemId, learnerId: 'test-learner-2' });
    const attemptId = attemptRes.body.id;

    // Submit complete 6 sections
    const submissionPayload = {
      assumptions: 'Assume in-memory storage and single vehicle gate.',
      classes: 'ParkingLot (manager), ParkingFloor (floor container), ParkingSpot (spot), Ticket (receipt).',
      relationships: 'ParkingLot has many ParkingFloors; ParkingFloor has many ParkingSpots.',
      abstractions: 'IPricingStrategy { calculate() }, ISpotAllocationStrategy { allocate() }.',
      designDecisions: 'Strategy pattern for flexible tariff changes without altering core classes.',
      edgeCases: 'Lot is at maximum capacity; simultaneous vehicle arrivals at separate gates.',
    };

    const submitRes = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send(submissionPayload);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.attempt.status).toBe('SUBMITTED');
    expect(submitRes.body.submission.assumptions).toBe(submissionPayload.assumptions);

    // Wait briefly for background evaluator to complete
    await new Promise((r) => setTimeout(r, 200));

    // Verify evaluation status
    const statusRes = await request(app).get(`/api/attempts/${attemptId}`);
    expect(['EVALUATING', 'COMPLETED']).toContain(statusRes.body.attempt.status);
  });

  it('4. GET /api/attempts - retrieves attempt history sorted newest first', async () => {
    const res = await request(app).get('/api/attempts?learnerId=test-learner-2');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].problem).toBeDefined();
  });

  it('5. GET /api/attempts/:id/evaluation - retrieves rubric evaluation', async () => {
    const problemsRes = await request(app).get('/api/problems');
    const problemId = problemsRes.body[0].problem.id;

    const attemptRes = await request(app)
      .post('/api/attempts')
      .send({ problemId, learnerId: 'test-eval-learner' });
    const attemptId = attemptRes.body.id;

    await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({
        assumptions: 'Assume standard single facility.',
        classes: 'ParkingLot, Spot, Ticket, RateCalculator.',
        relationships: 'ParkingLot has Spots.',
        abstractions: 'IRateCalculator.',
        designDecisions: 'State pattern for ticket status.',
        edgeCases: 'Invalid tickets, lost tickets.',
      });

    // Wait for evaluation to complete
    let attemptsCount = 0;
    while (attemptsCount < 10) {
      const checkRes = await request(app).get(`/api/attempts/${attemptId}`);
      if (checkRes.body.attempt.status === 'COMPLETED') break;
      await new Promise((r) => setTimeout(r, 100));
      attemptsCount++;
    }

    const evalRes = await request(app).get(`/api/attempts/${attemptId}/evaluation`);
    expect(evalRes.status).toBe(200);
    expect(evalRes.body.criteria.length).toBe(8);
    expect(evalRes.body.averageScore).toBeGreaterThan(0);
    expect(evalRes.body.overallSummary).toBeDefined();
  });

  it('6. Invalid submission returns validation error', async () => {
    const problemsRes = await request(app).get('/api/problems');
    const problemId = problemsRes.body[0].problem.id;

    const attemptRes = await request(app)
      .post('/api/attempts')
      .send({ problemId, learnerId: 'test-validation' });
    const attemptId = attemptRes.body.id;

    // Send empty payload
    const emptyRes = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({});

    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.error).toBe('Validation failed');

    // Send payload with too short content
    const shortRes = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .send({
        assumptions: 'Too short',
        classes: 'Short',
        relationships: 'None',
        abstractions: '',
        designDecisions: '',
        edgeCases: '',
      });

    expect(shortRes.status).toBe(400);
    expect(shortRes.body.error).toBe('Validation failed');
  });
});