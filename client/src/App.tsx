import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation.js';
import { HomePage } from './pages/HomePage.js';
import { ProblemPage } from './pages/ProblemPage.js';
import { PracticePage } from './pages/PracticePage.js';
import { FeedbackPage } from './pages/FeedbackPage.js';
import { HistoryPage } from './pages/HistoryPage.js';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans antialiased">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems/:id" element={<ProblemPage />} />
            <Route path="/practice/:attemptId" element={<PracticePage />} />
            <Route path="/feedback/:attemptId" element={<FeedbackPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-edge py-6 text-center text-xs text-ink-tertiary">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>LLD Practice &bull; Software Engineering Learning Platform</span>
            <span className="font-mono text-[11px]">8-Criterion Objective Rubric Evaluation</span>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;