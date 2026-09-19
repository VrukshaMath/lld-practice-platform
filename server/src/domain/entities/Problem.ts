export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ProblemProps {
  id?: string;
  slug: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  concepts: string[];
  requirements: string[];
  evaluationFocus: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Problem {
  public readonly id?: string;
  public readonly slug: string;
  public readonly title: string;
  public readonly description: string;
  public readonly difficulty: DifficultyLevel;
  public readonly concepts: string[];
  public readonly requirements: string[];
  public readonly evaluationFocus: string[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: ProblemProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.description = props.description;
    this.difficulty = props.difficulty;
    this.concepts = props.concepts;
    this.requirements = props.requirements;
    this.evaluationFocus = props.evaluationFocus;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
