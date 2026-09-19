import mongoose from 'mongoose';
import { Attempt } from '../../../domain/entities/Attempt.js';
import { AttemptRepository } from '../../../domain/interfaces/AttemptRepository.js';
import { AttemptModel, IAttemptDoc } from '../schemas/AttemptSchema.js';

export class MongoAttemptRepository implements AttemptRepository {
  private toDomain(doc: IAttemptDoc): Attempt {
    return new Attempt({
      id: doc._id.toString(),
      problemId: doc.problemId.toString(),
      learnerId: doc.learnerId,
      status: doc.status,
      submittedAt: doc.submittedAt,
      evaluationStartedAt: doc.evaluationStartedAt,
      evaluationCompletedAt: doc.evaluationCompletedAt,
      evaluationError: doc.evaluationError,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Attempt | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    const doc = await AttemptModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByLearnerId(learnerId: string): Promise<Attempt[]> {
    const docs = await AttemptModel.find({ learnerId }).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByProblemId(problemId: string, learnerId?: string): Promise<Attempt[]> {
    if (!problemId.match(/^[0-9a-fA-F]{24}$/)) {
      return [];
    }
    const filter: any = { problemId: new mongoose.Types.ObjectId(problemId) };
    if (learnerId) {
      filter.learnerId = learnerId;
    }
    const docs = await AttemptModel.find(filter).sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async countByProblemId(problemId: string, learnerId?: string): Promise<number> {
    if (!problemId.match(/^[0-9a-fA-F]{24}$/)) {
      return 0;
    }
    const filter: any = { problemId: new mongoose.Types.ObjectId(problemId) };
    if (learnerId) {
      filter.learnerId = learnerId;
    }
    return AttemptModel.countDocuments(filter);
  }

  async create(attempt: Attempt): Promise<Attempt> {
    const doc = await AttemptModel.create({
      problemId: new mongoose.Types.ObjectId(attempt.problemId),
      learnerId: attempt.learnerId,
      status: attempt.getStatus(),
      submittedAt: attempt.submittedAt,
      evaluationStartedAt: attempt.evaluationStartedAt,
      evaluationCompletedAt: attempt.evaluationCompletedAt,
      evaluationError: attempt.evaluationError,
    });
    return this.toDomain(doc);
  }

  async save(attempt: Attempt): Promise<Attempt> {
    if (!attempt.id) {
      return this.create(attempt);
    }
    const doc = await AttemptModel.findByIdAndUpdate(
      attempt.id,
      {
        status: attempt.getStatus(),
        submittedAt: attempt.submittedAt,
        evaluationStartedAt: attempt.evaluationStartedAt,
        evaluationCompletedAt: attempt.evaluationCompletedAt,
        evaluationError: attempt.evaluationError,
      },
      { new: true }
    );
    if (!doc) {
      throw new Error(`Attempt with id ${attempt.id} not found to save.`);
    }
    return this.toDomain(doc);
  }

  async deleteAll(): Promise<void> {
    await AttemptModel.deleteMany({});
  }
}
