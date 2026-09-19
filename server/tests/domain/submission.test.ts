import { describe, it, expect } from 'vitest';
import { Submission } from '../../src/domain/entities/Submission.js';

describe('Submission Entity (Domain Layer)', () => {
  it('1. Empty submission rejected by isComplete()', () => {
    const submission = new Submission({
      attemptId: '507f1f77bcf86cd799439011',
      assumptions: '',
      classes: '',
      relationships: '',
      abstractions: '',
      designDecisions: '',
      edgeCases: '',
    });

    expect(submission.isComplete()).toBe(false);
  });

  it('2. Incomplete submission (missing some required sections) rejected', () => {
    const partialSubmission = new Submission({
      attemptId: '507f1f77bcf86cd799439011',
      assumptions: 'Assume single entrance.',
      classes: 'ParkingLot, Vehicle',
      relationships: 'ParkingLot has Spots',
      abstractions: '', // Empty abstraction
      designDecisions: 'Strategy pattern for pricing',
      edgeCases: '    ', // Whitespace only
    });

    expect(partialSubmission.isComplete()).toBe(false);
  });

  it('3. Complete submission accepted when all 6 sections are populated', () => {
    const completeSubmission = new Submission({
      attemptId: '507f1f77bcf86cd799439011',
      assumptions: 'Assume 500 capacity, in-memory operations.',
      classes: 'ParkingLot, ParkingSpot, Ticket, Vehicle',
      relationships: 'ParkingLot has Spots, Vehicle has Ticket',
      abstractions: 'IPricingStrategy, ISpotAssignmentStrategy',
      designDecisions: 'Used Strategy pattern for pricing to isolate hourly formulas.',
      edgeCases: 'Full capacity rejects entry; concurrent ticket issuance is mutexed.',
    });

    expect(completeSubmission.isComplete()).toBe(true);
  });
});