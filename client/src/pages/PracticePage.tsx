import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { AttemptDetail } from '../types/index.js';
import { TextareaField } from '../components/TextareaField.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { ArrowLeft, BookOpen, Send, AlertCircle } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showProblemContext, setShowProblemContext] = useState(false);

  // Form state
  const [assumptions, setAssumptions] = useState('');
  const [classes, setClasses] = useState('');
  const [relationships, setRelationships] = useState('');
  const [abstractions, setAbstractions] = useState('');
  const [designDecisions, setDesignDecisions] = useState('');
  const [edgeCases, setEdgeCases] = useState('');

  const fetchAttempt = async () => {
    if (!attemptId) return;
    try {
      setLoading(true);
      setServerError(null);
      const data = await api.getAttempt(attemptId);
      setDetail(data);

      if (data.attempt.status !== 'DRAFT') {
        navigate(`/feedback/${attemptId}`);
        return;
      }

      if (data.submission) {
        setAssumptions(data.submission.assumptions || '');
        setClasses(data.submission.classes || '');
        setRelationships(data.submission.relationships || '');
        setAbstractions(data.submission.abstractions || '');
        setDesignDecisions(data.submission.designDecisions || '');
        setEdgeCases(data.submission.edgeCases || '');
      }
    } catch (err: any) {
      setServerError(err.message || 'Failed to load practice attempt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const sections = [
    { key: 'assumptions', val: assumptions, min: 10 },
    { key: 'classes', val: classes, min: 15 },
    { key: 'relationships', val: relationships, min: 10 },
    { key: 'abstractions', val: abstractions, min: 10 },
    { key: 'designDecisions', val: designDecisions, min: 10 },
    { key: 'edgeCases', val: edgeCases, min: 10 },
  ];

  const completedSectionsCount = sections.filter(
    (s) => s.val.trim().length >= s.min
  ).length;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (assumptions.trim().length < 10) {
      errors.assumptions = 'Please provide at least 10 characters detailing your assumptions.';
    }
    if (classes.trim().length < 15) {
      errors.classes = 'Please specify core classes, responsibilities, and attributes (min 15 chars).';
    }
    if (relationships.trim().length < 10) {
      errors.relationships = 'Describe how classes collaborate, inherit, or compose (min 10 chars).';
    }
    if (abstractions.trim().length < 10) {
      errors.abstractions = 'List key interfaces or abstract classes (min 10 chars).';
    }
    if (designDecisions.trim().length < 10) {
      errors.designDecisions = 'Explain design patterns, trade-offs, and decisions (min 10 chars).';
    }
    if (edgeCases.trim().length < 10) {
      errors.edgeCases = 'Detail at least 2-3 boundary conditions or error scenarios (min 10 chars).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attemptId) return;

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      setServerError(null);
      await api.submitSolution(attemptId, {
        assumptions,
        classes,
        relationships,
        abstractions,
        designDecisions,
        edgeCases,
      });

      navigate(`/feedback/${attemptId}`);
    } catch (err: any) {
      setServerError(err.message || 'Submission failed. Please verify your inputs.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading practice workspace..." />;
  }

  if (serverError && !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState message={serverError} onRetry={fetchAttempt} />
      </div>
    );
  }

  const problem = detail?.problem;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-edge">
        <div className="flex items-center gap-3">
          <Link
            to={`/problems/${problem?.id || problem?.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-secondary hover:text-ink transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Problem Spec</span>
          </Link>
          <span className="text-edge-strong">&bull;</span>
          <span className="text-sm font-semibold text-ink">{problem?.title}</span>
          <span className="text-xs font-mono text-ink-tertiary">
            (Attempt #{detail?.attemptNumber || 1})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowProblemContext(!showProblemContext)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-ink-secondary bg-canvas-subtle hover:bg-canvas-muted border border-edge transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-ink-tertiary" />
            <span>{showProblemContext ? 'Hide Specs' : 'View Specs'}</span>
          </button>
          <StatusBadge status={detail?.attempt.status || 'DRAFT'} size="sm" />
        </div>
      </div>

      {/* Collapsible Problem Specs Drawer */}
      {showProblemContext && problem && (
        <div className="rounded-lg border border-edge bg-surface p-5 mb-6 text-xs text-ink-secondary leading-relaxed shadow-subtle">
          <div className="font-semibold text-ink mb-2">
            {problem.title} &mdash; Reference Requirements
          </div>
          <p className="mb-3 text-ink-secondary">{problem.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-edge-subtle">
            <div>
              <span className="font-mono uppercase tracking-wider text-[10px] text-ink-tertiary font-semibold block mb-1">
                Functional Requirements:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {problem.requirements.slice(0, 5).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-mono uppercase tracking-wider text-[10px] text-ink-tertiary font-semibold block mb-1">
                Evaluation Focus:
              </span>
              <ul className="list-disc list-inside space-y-1">
                {problem.evaluationFocus.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Strip */}
      <div className="flex items-center justify-between rounded-lg bg-surface border border-edge px-4 py-3 mb-6 shadow-subtle">
        <span className="text-xs font-mono text-ink-secondary">
          Submission Progress: {completedSectionsCount} of 6 sections filled
        </span>
        <div className="w-32 sm:w-44 bg-canvas-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-ink h-1.5 transition-all duration-200"
            style={{ width: `${(completedSectionsCount / 6) * 100}%` }}
          />
        </div>
      </div>

      {serverError && (
        <div className="mb-6">
          <ErrorState message={serverError} />
        </div>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <div className="rounded-lg border border-tag-roseBorder bg-surface p-4 mb-6 text-xs text-tag-roseText shadow-subtle">
          <div className="flex items-center gap-1.5 font-semibold mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Please complete all 6 sections before submitting:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-4 text-ink-secondary">
            {Object.values(validationErrors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6 Structured Submission Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="assumptions"
            label="1. Assumptions & Scope"
            explanation="Define scale, boundaries, hardware assumptions, throughput constraints, and non-functional assumptions."
            placeholder="e.g. In-memory storage, 500-vehicle capacity, single gate per floor, standard payment terminal interface..."
            value={assumptions}
            onChange={(val) => {
              setAssumptions(val);
              if (validationErrors.assumptions) {
                setValidationErrors((prev) => ({ ...prev, assumptions: '' }));
              }
            }}
            error={validationErrors.assumptions}
            rows={4}
          />
        </div>

        {/* Section 2 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="classes"
            label="2. Classes & Responsibilities"
            explanation="List domain entities, core properties, and member responsibilities. Adhere to Single Responsibility."
            placeholder="e.g. ParkingLot (orchestrates floors and gates), ParkingFloor (manages spots by type), ParkingSpot (tracks occupancy state), Ticket (records timestamp and vehicle details)..."
            value={classes}
            onChange={(val) => {
              setClasses(val);
              if (validationErrors.classes) {
                setValidationErrors((prev) => ({ ...prev, classes: '' }));
              }
            }}
            error={validationErrors.classes}
            rows={6}
          />
        </div>

        {/* Section 3 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="relationships"
            label="3. Relationships"
            explanation="Describe association, aggregation, composition, or inheritance between classes."
            placeholder="e.g. ParkingLot composition with ParkingFloor. ParkingFloor composition with ParkingSpot. Car, Motorcycle, Truck extend abstract Vehicle..."
            value={relationships}
            onChange={(val) => {
              setRelationships(val);
              if (validationErrors.relationships) {
                setValidationErrors((prev) => ({ ...prev, relationships: '' }));
              }
            }}
            error={validationErrors.relationships}
            rows={4}
          />
        </div>

        {/* Section 4 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="abstractions"
            label="4. Interfaces / Abstractions"
            explanation="Define contracts that decouple components and promote polymorphism (Dependency Inversion)."
            placeholder="e.g. interface FeeStrategy { calculateFee(ticket: Ticket): number }, interface SpotAllocationStrategy { allocate(vehicle: Vehicle): ParkingSpot | null }..."
            value={abstractions}
            onChange={(val) => {
              setAbstractions(val);
              if (validationErrors.abstractions) {
                setValidationErrors((prev) => ({ ...prev, abstractions: '' }));
              }
            }}
            error={validationErrors.abstractions}
            rows={5}
          />
        </div>

        {/* Section 5 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="designDecisions"
            label="5. Design Decisions & Trade-offs"
            explanation="Explain why specific patterns were chosen (Strategy, State, Factory, etc.) and what trade-offs were made."
            placeholder="e.g. Selected Strategy pattern for dynamic pricing formulas to satisfy the Open-Closed Principle. Traded distributed complexity for an in-memory lock on spot reservation..."
            value={designDecisions}
            onChange={(val) => {
              setDesignDecisions(val);
              if (validationErrors.designDecisions) {
                setValidationErrors((prev) => ({ ...prev, designDecisions: '' }));
              }
            }}
            error={validationErrors.designDecisions}
            rows={5}
          />
        </div>

        {/* Section 6 */}
        <div className="rounded-lg border border-edge bg-surface p-6 shadow-card">
          <TextareaField
            id="edgeCases"
            label="6. Edge Cases & Concurrency"
            explanation="Detail boundary conditions, race conditions, full capacity handling, and failure modes."
            placeholder="e.g. 1. Facility reaches full capacity (gate display alerts driver, ticket issuing disabled). 2. Concurrent arrivals competing for the last spot (synchronized slot checkout). 3. Lost ticket recovery..."
            value={edgeCases}
            onChange={(val) => {
              setEdgeCases(val);
              if (validationErrors.edgeCases) {
                setValidationErrors((prev) => ({ ...prev, edgeCases: '' }));
              }
            }}
            error={validationErrors.edgeCases}
            rows={5}
          />
        </div>

        {/* Submission Action Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-edge">
          <Link
            to={`/problems/${problem?.id || problem?.slug}`}
            className="text-xs font-mono text-ink-tertiary hover:text-ink transition"
          >
            Cancel and Return
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded text-xs sm:text-sm font-semibold text-surface bg-ink hover:bg-accent-hover active:scale-[0.99] transition shadow-subtle disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting Solution...' : 'Submit Solution'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};