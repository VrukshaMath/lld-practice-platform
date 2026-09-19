import { Problem } from '../../../domain/entities/Problem.js';
import { ProblemRepository } from '../../../domain/interfaces/ProblemRepository.js';
import { ProblemModel, IProblemDoc } from '../schemas/ProblemSchema.js';

export class MongoProblemRepository implements ProblemRepository {
  private toDomain(doc: IProblemDoc): Problem {
    return new Problem({
      id: doc._id.toString(),
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      difficulty: doc.difficulty,
      concepts: doc.concepts,
      requirements: doc.requirements,
      evaluationFocus: doc.evaluationFocus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findAll(): Promise<Problem[]> {
    const docs = await ProblemModel.find().sort({ createdAt: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Problem | null> {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    const doc = await ProblemModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const doc = await ProblemModel.findOne({ slug });
    return doc ? this.toDomain(doc) : null;
  }

  async create(problem: Problem): Promise<Problem> {
    const doc = await ProblemModel.create({
      slug: problem.slug,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      concepts: problem.concepts,
      requirements: problem.requirements,
      evaluationFocus: problem.evaluationFocus,
    });
    return this.toDomain(doc);
  }

  async deleteAll(): Promise<void> {
    await ProblemModel.deleteMany({});
  }
}
