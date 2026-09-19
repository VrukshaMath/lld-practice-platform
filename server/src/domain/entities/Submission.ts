export interface SubmissionProps {
  id?: string;
  attemptId: string;
  assumptions: string;
  classes: string;
  relationships: string;
  abstractions: string;
  designDecisions: string;
  edgeCases: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Submission {
  public readonly id?: string;
  public readonly attemptId: string;
  public readonly assumptions: string;
  public readonly classes: string;
  public readonly relationships: string;
  public readonly abstractions: string;
  public readonly designDecisions: string;
  public readonly edgeCases: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: SubmissionProps) {
    this.id = props.id;
    this.attemptId = props.attemptId;
    this.assumptions = props.assumptions || '';
    this.classes = props.classes || '';
    this.relationships = props.relationships || '';
    this.abstractions = props.abstractions || '';
    this.designDecisions = props.designDecisions || '';
    this.edgeCases = props.edgeCases || '';
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Returns false if any required section is empty or contains only whitespace.
   */
  public isComplete(): boolean {
    const sections = [
      this.assumptions,
      this.classes,
      this.relationships,
      this.abstractions,
      this.designDecisions,
      this.edgeCases,
    ];

    return sections.every((section) => typeof section === 'string' && section.trim().length > 0);
  }

  public toJSON() {
    return {
      id: this.id,
      attemptId: this.attemptId,
      assumptions: this.assumptions,
      classes: this.classes,
      relationships: this.relationships,
      abstractions: this.abstractions,
      designDecisions: this.designDecisions,
      edgeCases: this.edgeCases,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
