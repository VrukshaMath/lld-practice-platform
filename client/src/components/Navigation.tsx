import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isProblemsActive = location.pathname === '/' || location.pathname.startsWith('/problems');
  const isHistoryActive = location.pathname.startsWith('/history');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-edge bg-surface/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex items-center justify-center w-7 h-7 rounded bg-ink text-surface font-mono text-xs font-bold tracking-tight">
              LD
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm tracking-tight text-ink group-hover:text-ink-secondary transition">
                LLD Practice
              </span>
              <span className="text-[10px] font-mono tracking-widest text-ink-tertiary uppercase hidden sm:inline">
                / Studio
              </span>
            </div>
          </Link>

          {/* Primary Nav */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                isProblemsActive && !isHistoryActive
                  ? 'bg-canvas-subtle text-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink hover:bg-canvas-subtle/60'
              }`}
            >
              Problems
            </Link>
            <Link
              to="/history"
              className={`px-3 py-1.5 rounded text-xs font-medium transition ${
                isHistoryActive
                  ? 'bg-canvas-subtle text-ink font-semibold'
                  : 'text-ink-secondary hover:text-ink hover:bg-canvas-subtle/60'
              }`}
            >
              History
            </Link>
          </nav>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas-subtle border border-edge text-[11px] font-mono text-ink-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>demo-user</span>
          </div>
        </div>
      </div>
    </header>
  );
};