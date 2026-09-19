import React from 'react';
import { CriterionEvaluation } from '../types/index.js';

interface RubricCardProps {
  item: CriterionEvaluation;
  index: number;
}

export const RubricCard: React.FC<RubricCardProps> = ({ item, index }) => {
  const score = item.score;
  const confidencePercent = Math.round((item.confidence || 1) * 100);

  const getScoreBadge = (s: number) => {
    if (s >= 4) {
      return 'bg-tag-greenBg text-tag-greenText border-tag-greenBorder';
    }
    if (s === 3) {
      return 'bg-tag-amberBg text-tag-amberText border-tag-amberBorder';
    }
    return 'bg-tag-roseBg text-tag-roseText border-tag-roseBorder';
  };

  const isConcernNoted =
    item.concern &&
    item.concern.trim().toLowerCase() !== 'none' &&
    item.concern.trim() !== '';

  return (
    <div className="rounded-lg border border-edge bg-surface p-5 shadow-subtle hover:border-edge-strong transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-edge-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-tertiary font-medium">
              0{index + 1}.
            </span>
            <h4 className="text-sm font-semibold text-ink tracking-tight">
              {item.criterion}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[11px] font-mono text-ink-tertiary">
            {confidencePercent}% conf
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${getScoreBadge(
              score
            )}`}
          >
            {score} / 5
          </span>
        </div>
      </div>

      {/* Evidence */}
      {item.evidence && (
        <div className="my-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
            Evidence from Submission
          </div>
          <div className="border-l-2 border-ink-tertiary pl-3 py-1 text-xs font-mono text-ink-secondary bg-canvas-subtle/80 rounded-r">
            &ldquo;{item.evidence}&rdquo;
          </div>
        </div>
      )}

      {/* Concern */}
      <div className="my-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
          Architectural Concern
        </div>
        <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
          {isConcernNoted
            ? item.concern
            : 'No significant architectural anti-patterns detected.'}
        </p>
      </div>

      {/* Suggestion */}
      {item.suggestion && (
        <div className="mt-3 pt-3 border-t border-edge-subtle">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
            Prescriptive Recommendation
          </div>
          <div className="text-xs sm:text-sm text-ink leading-relaxed bg-canvas-subtle p-3 rounded border border-edge-subtle">
            {item.suggestion}
          </div>
        </div>
      )}
    </div>
  );
};