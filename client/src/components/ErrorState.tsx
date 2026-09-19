import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-lg border border-tag-roseBorder bg-surface p-5 my-4 max-w-lg mx-auto shadow-subtle">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-tag-roseText shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-canvas-subtle hover:bg-canvas-muted border border-edge rounded transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-ink-secondary" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};