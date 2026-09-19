import mongoose, { Schema, Document } from 'mongoose';

export interface IProblemDoc extends Document {
  slug: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  concepts: string[];
  requirements: string[];
  evaluationFocus: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProblemSchema = new Schema<IProblemDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    concepts: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    evaluationFocus: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const ProblemModel = mongoose.model<IProblemDoc>('Problem', ProblemSchema);
