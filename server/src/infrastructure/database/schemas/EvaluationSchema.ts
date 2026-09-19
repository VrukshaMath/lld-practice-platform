import mongoose, { Schema, Document } from 'mongoose';

export interface ICriterionDoc {
  criterion: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

export interface IEvaluationDoc extends Document {
  attemptId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  overallSummary: string;
  criteria: ICriterionDoc[];
  strengths: string[];
  improvements: string[];
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CriterionSchema = new Schema<ICriterionDoc>(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 5 },
    evidence: { type: String, default: '' },
    concern: { type: String, default: '' },
    suggestion: { type: String, default: '' },
    confidence: { type: Number, default: 1, min: 0, max: 1 },
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluationDoc>(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    overallSummary: { type: String, default: '' },
    criteria: { type: [CriterionSchema], default: [] },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    error: { type: String },
  },
  {
    timestamps: true,
  }
);

export const EvaluationModel = mongoose.model<IEvaluationDoc>('Evaluation', EvaluationSchema);
