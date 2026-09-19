import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { ProblemWithCount } from '../types/index.js';
import { ProblemCard } from '../components/ProblemCard.js';
import { LoadingState } from '../components/LoadingState.js';
import { ErrorState } from '../components/ErrorState.js';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProblems();
      setProblems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Editorial Header */}
      <div className="border-b border-edge pb-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-ink-tertiary mb-1.5 font-semibold">
              Software Architecture &bull; Domain Modeling
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight font-sans">
              LLD Practice
            </h1>
            <p className="mt-2 text-sm text-ink-secondary max-w-2xl leading-relaxed">
              Practice object-oriented design. Get explainable feedback. Improve with every attempt.
            </p>
          </div>

          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-secondary hover:text-ink transition self-start sm:self-auto border border-edge bg-surface px-3 py-1.5 rounded shadow-subtle"
          >
            <span>View History</span>
            <ArrowRight className="w-3.5 h-3.5 text-ink-tertiary" />
          </Link>
        </div>

        {/* Workflow Steps Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-edge-subtle">
          {[
            { step: '01', title: 'Choose Problem', desc: 'Classic domain requirements' },
            { step: '02', title: 'Structure Design', desc: '6 cognitive design sections' },
            { step: '03', title: 'Rubric Review', desc: '8-point evidence evaluation' },
            { step: '04', title: 'Iterate & Refine', desc: 'Measure progression over time' },
          ].map((item) => (
            <div key={item.step} className="p-3 rounded border border-edge-subtle bg-surface/60">
              <span className="text-[10px] font-mono font-bold text-ink-tertiary block mb-1">
                {item.step}
              </span>
              <div className="text-xs font-semibold text-ink">{item.title}</div>
              <div className="text-[11px] text-ink-tertiary mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Problems Section */}
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-sm font-mono uppercase tracking-wider text-ink-tertiary font-semibold">
          Available Problems ({problems.length})
        </h2>
        <span className="text-xs font-mono text-ink-tertiary">
          Evaluation: Objective 8-Criterion Rubric
        </span>
      </div>

      {loading && <LoadingState message="Loading practice problems..." />}
      {error && <ErrorState message={error} onRetry={fetchProblems} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map(({ problem, attemptCount }) => (
            <ProblemCard
              key={problem.id || problem.slug}
              problem={problem}
              attemptCount={attemptCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};