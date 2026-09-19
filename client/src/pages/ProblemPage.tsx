import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Problem } from '../types/index.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { ArrowLeft, ArrowRight, History } from 'lucide-react';

export const ProblemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingAttempt, setStartingAttempt] = useState(false);

  const fetchProblem = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProblem(id);
      setProblem(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load problem specification.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const handleStartPractice = async () => {
    if (!problem?.id) return;
    try {
      setStartingAttempt(true);
      const attempt = await api.createAttempt(problem.id);
      navigate(`/practice/${attempt.id}`);
    } catch (err: any) {
      alert(`Failed to start practice attempt: ${err.message}`);
      setStartingAttempt(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading specification..." />;
  }

  if (error || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-secondary hover:text-ink mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to problems</span>
        </Link>
        <ErrorState message={error || 'Problem not found'} onRetry={fetchProblem} />
      </div>
    );
  }

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-tag-greenBg text-tag-greenText border-tag-greenBorder';
      case 'Medium':
        return 'bg-tag-amberBg text-tag-amberText border-tag-amberBorder';
      case 'Hard':
        return 'bg-tag-roseBg text-tag-roseText border-tag-roseBorder';
      default:
        return 'bg-tag-stoneBg text-tag-stoneText border-tag-stoneBorder';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-edge">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-secondary hover:text-ink transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Problems</span>
        </Link>

        <span className="text-xs font-mono text-ink-tertiary">
          Spec: {problem.slug}
        </span>
      </div>

      {/* Main Spec Card */}
      <div className="rounded-lg border border-edge bg-surface p-6 sm:p-8 shadow-card mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getDifficultyBadge(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <span className="text-xs font-mono text-ink-tertiary">
            System Design Specification
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          {problem.title}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-ink-secondary leading-relaxed max-w-3xl">
          {problem.description}
        </p>

        {/* Multiple Valid Designs Note */}
        <div className="mt-6 rounded border border-edge bg-canvas-subtle p-4 text-xs sm:text-sm text-ink-secondary leading-relaxed">
          <strong className="text-ink font-semibold">Multiple valid designs are possible.</strong>{' '}
          Focus on explaining your reasoning, clear class responsibilities, extensible
          abstractions, and trade-offs rather than attempting to match a single canonical pattern.
        </div>

        {/* CTA Bar */}
        <div className="mt-8 pt-6 border-t border-edge-subtle flex flex-wrap items-center gap-3">
          <button
            onClick={handleStartPractice}
            disabled={startingAttempt}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded text-xs sm:text-sm font-semibold text-surface bg-ink hover:bg-accent-hover active:scale-[0.99] transition shadow-subtle disabled:opacity-50"
          >
            <span>{startingAttempt ? 'Initializing Attempt...' : 'Start Practice'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-medium text-ink bg-canvas-subtle hover:bg-canvas-muted border border-edge transition"
          >
            <History className="w-3.5 h-3.5 text-ink-secondary" />
            <span>View Previous Attempts</span>
          </Link>
        </div>
      </div>

      {/* Specifications Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requirements (2 Cols) */}
        <div className="md:col-span-2 rounded-lg border border-edge bg-surface p-6 shadow-subtle">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-4">
            Functional Requirements ({problem.requirements.length})
          </h2>
          <ol className="space-y-3">
            {problem.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-ink-secondary leading-relaxed">
                <span className="font-mono text-xs font-semibold text-ink-tertiary shrink-0 mt-0.5">
                  {String(idx + 1).padStart(2, '0')}.
                </span>
                <span>{req}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sidebar: Concepts & Focus */}
        <div className="space-y-6">
          {/* Key Concepts */}
          <div className="rounded-lg border border-edge bg-surface p-5 shadow-subtle">
            <h3 className="text-xs font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-3">
              Target Concepts
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {problem.concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-canvas-subtle text-ink-secondary border border-edge"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Evaluation Focus */}
          <div className="rounded-lg border border-edge bg-surface p-5 shadow-subtle">
            <h3 className="text-xs font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-3">
              Evaluation Focus
            </h3>
            <ul className="space-y-2 text-xs text-ink-secondary">
              {problem.evaluationFocus.map((focus, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-ink-tertiary" />
                  <span>{focus}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};