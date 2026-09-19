import React from 'react';
import { AttemptStatus } from '../types/index.js';

interface StatusBadgeProps {
  status: AttemptStatus | 'PENDING';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'DRAFT':
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-tag-stoneBg text-tag-stoneText border-tag-stoneBorder ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
          Draft
        </span>
      );
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-[#f0f4f8] text-[#1e3a5f] border-[#d4e1ec] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mr-1.5" />
          Submitted
        </span>
      );
    case 'EVALUATING':
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-tag-amberBg text-tag-amberText border-tag-amberBorder ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse mr-1.5" />
          Evaluating
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-tag-greenBg text-tag-greenText border-tag-greenBorder ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#276738] mr-1.5" />
          Completed
        </span>
      );
    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-tag-roseBg text-tag-roseText border-tag-roseBorder ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />
          Failed
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center font-mono font-medium rounded border bg-canvas-subtle text-ink-secondary border-edge ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
};