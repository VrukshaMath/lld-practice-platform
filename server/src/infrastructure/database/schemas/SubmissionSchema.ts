import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmissionDoc extends Document {
  attemptId: mongoose.Types.ObjectId;
  assumptions: string;
  classes: string;
  relationships: string;
  abstractions: string;
  designDecisions: string;
  edgeCases: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmissionDoc>(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, unique: true, index: true },
    assumptions: { type: String, default: '' },
    classes: { type: String, default: '' },
    relationships: { type: String, default: '' },
    abstractions: { type: String, default: '' },
    designDecisions: { type: String, default: '' },
    edgeCases: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const SubmissionModel = mongoose.model<ISubmissionDoc>('Submission', SubmissionSchema);
