import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { AttemptDetail } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { EmptyState } from '../components/EmptyState.js';
import { ArrowRight } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [attempts, setAttempts] = useState<AttemptDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAttempts();
      setAttempts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load attempt history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8 pb-4 border-b border-edge">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
            Learning Progression
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Attempt History
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Review previous designs, track rubric score progression, and inspect architectural feedback.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-surface bg-ink hover:bg-accent-hover transition shadow-subtle"
        >
          <span>New Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading && <LoadingState message="Loading practice history..." />}
      {error && <ErrorState message={error} onRetry={fetchAttempts} />}

      {!loading && !error && attempts.length === 0 && (
        <EmptyState
          title="No attempts yet"
          message="Your practice history will appear here after your first submission."
          actionText="Explore Problems"
          actionLink="/"
        />
      )}

      {!loading && !error && attempts.length > 0 && (
        <div className="space-y-3">
          {attempts.map(({ attempt, problem, evaluation }, idx) => {
            const avgScore = evaluation?.averageScore;
            const targetUrl =
              attempt.status === 'DRAFT'
                ? `/practice/${attempt.id}`
                : `/feedback/${attempt.id}`;

            return (
              <Link
                key={attempt.id}
                to={targetUrl}
                className="block rounded-lg border border-edge bg-surface p-5 shadow-card hover:border-edge-strong transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs font-mono font-semibold text-ink-tertiary bg-canvas-subtle border border-edge px-2 py-0.5 rounded">
                        #{attempts.length - idx}
                      </span>
                      <h3 className="text-sm font-bold text-ink group-hover:text-ink-secondary transition">
                        {problem.title}
                      </h3>
                      <StatusBadge status={attempt.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-tertiary mt-2 font-mono">
                      <span>{formatDate(attempt.submittedAt || attempt.createdAt)}</span>
                      <span>&bull;</span>
                      <span>{problem.difficulty}</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-edge-subtle">
                    {attempt.status === 'COMPLETED' && avgScore !== undefined && (
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-mono">
                          Score
                        </div>
                        <div className="text-sm font-bold font-mono text-ink">
                          {avgScore} / 5
                        </div>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-ink bg-canvas-subtle group-hover:bg-canvas-muted border border-edge transition">
                      <span>{attempt.status === 'DRAFT' ? 'Continue Draft' : 'View Report'}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-ink-tertiary" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};