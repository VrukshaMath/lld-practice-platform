import mongoose from 'mongoose';
import { Submission } from '../../../domain/entities/Submission.js';
import { SubmissionRepository } from '../../../domain/interfaces/SubmissionRepository.js';
import { SubmissionModel, ISubmissionDoc } from '../schemas/SubmissionSchema.js';

export class MongoSubmissionRepository implements SubmissionRepository {
  private toDomain(doc: ISubmissionDoc): Submission {
    return new Submission({
      id: doc._id.toString(),
      attemptId: doc.attemptId.toString(),
      assumptions: doc.assumptions,
      classes: doc.classes,
      relationships: doc.relationships,
      abstractions: doc.abstractions,
      designDecisions: doc.designDecisions,
      edgeCases: doc.edgeCases,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByAttemptId(attemptId: string): Promise<Submission | null> {
    if (!attemptId.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    const doc = await SubmissionModel.findOne({
      attemptId: new mongoose.Types.ObjectId(attemptId),
    });
    return doc ? this.toDomain(doc) : null;
  }

  async create(submission: Submission): Promise<Submission> {
    const doc = await SubmissionModel.create({
      attemptId: new mongoose.Types.ObjectId(submission.attemptId),
      assumptions: submission.assumptions,
      classes: submission.classes,
      relationships: submission.relationships,
      abstractions: submission.abstractions,
      designDecisions: submission.designDecisions,
      edgeCases: submission.edgeCases,
    });
    return this.toDomain(doc);
  }

  async save(submission: Submission): Promise<Submission> {
    const doc = await SubmissionModel.findOneAndUpdate(
      { attemptId: new mongoose.Types.ObjectId(submission.attemptId) },
      {
        assumptions: submission.assumptions,
        classes: submission.classes,
        relationships: submission.relationships,
        abstractions: submission.abstractions,
        designDecisions: submission.designDecisions,
        edgeCases: submission.edgeCases,
      },
      { new: true, upsert: true }
    );
    return this.toDomain(doc);
  }

  async deleteAll(): Promise<void> {
    await SubmissionModel.deleteMany({});
  }
}
