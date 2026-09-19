import mongoose from 'mongoose';
import { Evaluation } from '../../../domain/entities/Evaluation.js';
import { EvaluationRepository } from '../../../domain/interfaces/EvaluationRepository.js';
import { EvaluationModel, IEvaluationDoc } from '../schemas/EvaluationSchema.js';

export class MongoEvaluationRepository implements EvaluationRepository {
  private toDomain(doc: IEvaluationDoc): Evaluation {
    return new Evaluation({
      id: doc._id.toString(),
      attemptId: doc.attemptId.toString(),
      status: doc.status,
      overallSummary: doc.overallSummary,
      criteria: doc.criteria,
      strengths: doc.strengths,
      improvements: doc.improvements,
      error: doc.error,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByAttemptId(attemptId: string): Promise<Evaluation | null> {
    if (!attemptId.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    const doc = await EvaluationModel.findOne({
      attemptId: new mongoose.Types.ObjectId(attemptId),
    });
    return doc ? this.toDomain(doc) : null;
  }

  async create(evaluation: Evaluation): Promise<Evaluation> {
    const doc = await EvaluationModel.create({
      attemptId: new mongoose.Types.ObjectId(evaluation.attemptId),
      status: evaluation.status,
      overallSummary: evaluation.overallSummary,
      criteria: evaluation.criteria,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      error: evaluation.error,
    });
    return this.toDomain(doc);
  }

  async save(evaluation: Evaluation): Promise<Evaluation> {
    const doc = await EvaluationModel.findOneAndUpdate(
      { attemptId: new mongoose.Types.ObjectId(evaluation.attemptId) },
      {
        status: evaluation.status,
        overallSummary: evaluation.overallSummary,
        criteria: evaluation.criteria,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        error: evaluation.error,
      },
      { new: true, upsert: true }
    );
    return this.toDomain(doc);
  }

  async deleteAll(): Promise<void> {
    await EvaluationModel.deleteMany({});
  }
}
