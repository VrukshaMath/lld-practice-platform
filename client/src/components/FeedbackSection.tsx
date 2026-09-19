import React from 'react';

interface FeedbackSectionProps {
  strengths: string[];
  improvements: string[];
}

export const FeedbackSection: React.FC<FeedbackSectionProps> = ({
  strengths,
  improvements,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {/* Strengths */}
      <div className="rounded-lg border border-edge bg-surface p-5 shadow-subtle">
        <div className="text-[11px] font-mono uppercase tracking-wider text-tag-greenText font-semibold mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-tag-greenText" />
          <span>Observed Strengths</span>
        </div>
        {strengths.length === 0 ? (
          <p className="text-xs text-ink-tertiary">No specific strengths highlighted.</p>
        ) : (
          <ul className="space-y-2 text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-tag-greenText font-bold select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Improvements */}
      <div className="rounded-lg border border-edge bg-surface p-5 shadow-subtle">
        <div className="text-[11px] font-mono uppercase tracking-wider text-tag-amberText font-semibold mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-tag-amberText" />
          <span>Priority Focus for Next Attempt</span>
        </div>
        {improvements.length === 0 ? (
          <p className="text-xs text-ink-tertiary">No critical improvements required.</p>
        ) : (
          <ul className="space-y-2 text-xs sm:text-sm text-ink-secondary leading-relaxed">
            {improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-tag-amberText font-bold select-none">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};