import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  subMessage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Loader2 className="w-5 h-5 text-ink-secondary animate-spin mb-3" />
      <h3 className="text-sm font-medium text-ink">{message}</h3>
      {subMessage && <p className="text-xs text-ink-tertiary mt-1 max-w-sm">{subMessage}</p>}
    </div>
  );
};