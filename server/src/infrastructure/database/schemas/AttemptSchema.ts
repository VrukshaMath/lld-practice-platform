import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptDoc extends Document {
  problemId: mongoose.Types.ObjectId;
  learnerId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
  submittedAt?: Date;
  evaluationStartedAt?: Date;
  evaluationCompletedAt?: Date;
  evaluationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttemptDoc>(
  {
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    learnerId: { type: String, required: true, default: 'demo-user', index: true },
    status: {
      type: String,
      enum: ['DRAFT', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'FAILED'],
      default: 'DRAFT',
      index: true,
    },
    submittedAt: { type: Date },
    evaluationStartedAt: { type: Date },
    evaluationCompletedAt: { type: Date },
    evaluationError: { type: String },
  },
  {
    timestamps: true,
  }
);

export const AttemptModel = mongoose.model<IAttemptDoc>('Attempt', AttemptSchema);
