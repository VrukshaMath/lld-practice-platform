import React from 'react';
import { Link } from 'react-router-dom';
import { Problem } from '../types/index.js';
import { ArrowRight } from 'lucide-react';

interface ProblemCardProps {
  problem: Problem;
  attemptCount: number;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, attemptCount }) => {
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
    <div className="flex flex-col justify-between rounded-lg border border-edge bg-surface p-6 shadow-card hover:border-edge-strong transition group">
      <div>
        {/* Top Meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getDifficultyBadge(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>

          {attemptCount > 0 && (
            <span className="text-[11px] font-mono text-ink-tertiary">
              {attemptCount} {attemptCount === 1 ? 'attempt' : 'attempts'}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-ink tracking-tight group-hover:text-ink-secondary transition">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-ink-secondary mt-2 leading-relaxed line-clamp-3">
          {problem.description}
        </p>

        {/* Concepts */}
        <div className="mt-5 pt-4 border-t border-edge-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-2">
            Key Concepts
          </div>
          <div className="flex flex-wrap gap-1.5">
            {problem.concepts.slice(0, 4).map((concept, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-canvas-subtle text-ink-secondary border border-edge"
              >
                {concept}
              </span>
            ))}
            {problem.concepts.length > 4 && (
              <span className="text-[10px] font-mono text-ink-tertiary self-center">
                +{problem.concepts.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-edge-subtle flex items-center justify-between">
        <span className="text-[11px] font-mono text-ink-tertiary">
          6 structured sections
        </span>

        <Link
          to={`/problems/${problem.id || problem.slug}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold text-surface bg-ink hover:bg-accent-hover transition shadow-subtle"
        >
          <span>Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};