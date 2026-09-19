import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { AttemptDetail } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { RubricCard } from '../components/RubricCard.js';
import { FeedbackSection } from '../components/FeedbackSection.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import {
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  FileText,
  Loader2,
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [creatingNewAttempt, setCreatingNewAttempt] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);

  const pollIntervalRef = useRef<any>(null);

  const fetchAttemptData = async (isPolling = false) => {
    if (!attemptId) return;
    try {
      if (!isPolling) setLoading(true);
      const data = await api.getAttempt(attemptId);
      setDetail(data);
      setError(null);

      // Stop polling once state is no longer EVALUATING or SUBMITTED
      if (data.attempt.status === 'COMPLETED' || data.attempt.status === 'FAILED') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (err: any) {
      if (!isPolling) {
        setError(err.message || 'Failed to retrieve evaluation report.');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttemptData();

    pollIntervalRef.current = setInterval(() => {
      fetchAttemptData(true);
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [attemptId]);

  // Try Again: Creates a NEW attempt for the same problem
  const handleTryAgain = async () => {
    if (!detail?.problem.id) return;
    try {
      setCreatingNewAttempt(true);
      const newAttempt = await api.createAttempt(detail.problem.id);
      navigate(`/practice/${newAttempt.id}`);
    } catch (err: any) {
      alert(`Failed to initialize new attempt: ${err.message}`);
      setCreatingNewAttempt(false);
    }
  };

  // Retry failed evaluation
  const handleRetryEvaluation = async () => {
    if (!attemptId) return;
    try {
      setRetrying(true);
      await api.retryEvaluation(attemptId);
      fetchAttemptData();
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchAttemptData(true);
        }, 2000);
      }
    } catch (err: any) {
      alert(`Failed to retry evaluation: ${err.message}`);
    } finally {
      setRetrying(false);
    }
  };

  const handleToggleFailureMode = async () => {
    const next = !simulateFailure;
    try {
      await api.toggleSimulateFailure(next);
      setSimulateFailure(next);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading && !detail) {
    return <LoadingState message="Loading evaluation report..." />;
  }

  if (error && !detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState message={error} onRetry={() => fetchAttemptData()} />
      </div>
    );
  }

  const attempt = detail?.attempt;
  const problem = detail?.problem;
  const evaluation = detail?.evaluation;
  const submission = detail?.submission;
  const status = attempt?.status;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-edge">
        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-secondary hover:text-ink transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>History</span>
          </Link>
          <span className="text-edge-strong">&bull;</span>
          <span className="text-sm font-semibold text-ink">{problem?.title}</span>
          <span className="text-xs font-mono text-ink-tertiary">
            (Attempt #{detail?.attemptNumber || 1})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtle Dev Switch for Demo / Resilience Testing */}
          <button
            onClick={handleToggleFailureMode}
            title="Dev toggle: simulate upstream AI timeout"
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition ${
              simulateFailure
                ? 'bg-tag-roseBg border-tag-roseBorder text-tag-roseText'
                : 'bg-canvas-subtle border-edge text-ink-tertiary hover:text-ink-secondary'
            }`}
          >
            <span>Simulate Failure: {simulateFailure ? 'ON' : 'OFF'}</span>
          </button>

          {status && <StatusBadge status={status} size="sm" />}
        </div>
      </div>

      {/* STATE 1: EVALUATING / SUBMITTED */}
      {(status === 'EVALUATING' || status === 'SUBMITTED') && (
        <div className="rounded-lg border border-edge bg-surface p-12 text-center my-8 shadow-card max-w-2xl mx-auto">
          <Loader2 className="w-6 h-6 text-ink animate-spin mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink">Analyzing your design...</h2>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-md mx-auto mt-2 leading-relaxed">
            Your solution has been submitted safely. Our evaluation engine is assessing class
            responsibilities, abstractions, encapsulation, and edge cases against the rubric.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-canvas-subtle border border-edge text-[11px] font-mono text-ink-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            <span>Polling backend every 2s</span>
          </div>
        </div>
      )}

      {/* STATE 2: FAILED */}
      {status === 'FAILED' && (
        <div className="rounded-lg border border-tag-roseBorder bg-surface p-6 my-6 shadow-card">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-tag-roseText shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-ink">
                Evaluation failed, but your submission is safe.
              </h3>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                {attempt?.evaluationError ||
                  'The evaluation engine encountered a temporary timeout. Your submission is preserved in the database.'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleRetryEvaluation}
                  disabled={retrying}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-surface bg-ink hover:bg-accent-hover transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                  <span>{retrying ? 'Retrying...' : 'Retry Evaluation'}</span>
                </button>

                <button
                  onClick={() => setShowSubmission(!showSubmission)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink bg-canvas-subtle hover:bg-canvas-muted border border-edge transition"
                >
                  <FileText className="w-3.5 h-3.5 text-ink-tertiary" />
                  <span>{showSubmission ? 'Hide Submission' : 'Inspect Preserved Solution'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: COMPLETED */}
      {status === 'COMPLETED' && evaluation && (
        <div>
          {/* Executive Assessment Card */}
          <div className="rounded-lg border border-edge bg-surface p-6 sm:p-8 shadow-card mb-8">
            <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4 pb-3 border-b border-edge-subtle">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold">
                  Architectural Assessment Report
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-ink mt-0.5">
                  Design Evaluation &bull; Attempt #{detail?.attemptNumber}
                </h2>
              </div>

              {evaluation.averageScore !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-canvas-subtle border border-edge">
                  <span className="text-xs text-ink-tertiary font-mono">Rubric Average:</span>
                  <span className="text-sm font-bold font-mono text-ink">
                    {evaluation.averageScore} / 5
                  </span>
                </div>
              )}
            </div>

            {/* Overall Assessment */}
            <div className="text-xs sm:text-sm text-ink-secondary leading-relaxed bg-canvas-subtle p-4 rounded border border-edge-subtle">
              {evaluation.overallSummary}
            </div>

            {/* Strengths & Improvements */}
            <FeedbackSection
              strengths={evaluation.strengths || []}
              improvements={evaluation.improvements || []}
            />

            {/* Iteration Action Bar */}
            <div className="pt-4 border-t border-edge-subtle flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-ink-tertiary">
                Ready to refine your design based on this feedback?
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSubmission(!showSubmission)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-ink bg-canvas-subtle hover:bg-canvas-muted border border-edge transition"
                >
                  <FileText className="w-3.5 h-3.5 text-ink-tertiary" />
                  <span>{showSubmission ? 'Hide Solution' : 'View Submitted Solution'}</span>
                </button>

                <button
                  onClick={handleTryAgain}
                  disabled={creatingNewAttempt}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold text-surface bg-ink hover:bg-accent-hover active:scale-[0.99] transition shadow-subtle disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{creatingNewAttempt ? 'Creating...' : 'Try Again'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 8-Criterion Rubric Grid */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-tertiary font-semibold">
                Rubric Criteria Breakdown ({evaluation.criteria?.length || 0})
              </h3>
              <span className="text-[11px] font-mono text-ink-tertiary">
                Scored 0 to 5 with Evidence Citation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.criteria?.map((criterion, idx) => (
                <RubricCard key={idx} item={criterion} index={idx} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Learner's Submitted Solution Drawer */}
      {showSubmission && submission && (
        <div className="rounded-lg border border-edge bg-surface p-6 my-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-edge">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-secondary" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                Submitted Solution &mdash; Attempt #{detail?.attemptNumber}
              </h3>
            </div>
            <button
              onClick={() => setShowSubmission(false)}
              className="text-xs font-mono text-ink-tertiary hover:text-ink"
            >
              [Close]
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="font-semibold text-ink mb-1">1. Assumptions & Scope:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.assumptions}
              </pre>
            </div>
            <div>
              <div className="font-semibold text-ink mb-1">2. Classes & Responsibilities:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.classes}
              </pre>
            </div>
            <div>
              <div className="font-semibold text-ink mb-1">3. Relationships:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.relationships}
              </pre>
            </div>
            <div>
              <div className="font-semibold text-ink mb-1">4. Interfaces / Abstractions:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.abstractions}
              </pre>
            </div>
            <div>
              <div className="font-semibold text-ink mb-1">5. Design Decisions & Trade-offs:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.designDecisions}
              </pre>
            </div>
            <div>
              <div className="font-semibold text-ink mb-1">6. Edge Cases & Concurrency:</div>
              <pre className="bg-canvas-subtle p-3 rounded text-ink-secondary whitespace-pre-wrap border border-edge-subtle">
                {submission.edgeCases}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};