import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-edge bg-surface shadow-subtle">
      <div className="w-9 h-9 rounded-md bg-canvas-subtle border border-edge flex items-center justify-center text-ink-tertiary mb-3">
        <FileText className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <p className="text-xs text-ink-secondary mt-1 max-w-sm leading-relaxed">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="mt-4 inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-surface bg-ink hover:bg-accent-hover rounded transition shadow-subtle"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};