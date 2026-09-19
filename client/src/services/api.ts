import {
  Problem,
  ProblemWithCount,
  Attempt,
  Submission,
  Evaluation,
  AttemptDetail,
} from '../types/index.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: any;
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: res.statusText || 'Request failed' };
    }
    const message = errorData.error || errorData.message || `HTTP Error ${res.status}`;
    const err: any = new Error(message);
    err.status = res.status;
    err.details = errorData.details;
    throw err;
  }
  return res.json();
}

export const api = {
  async getProblems(learnerId = 'demo-user'): Promise<ProblemWithCount[]> {
    const res = await fetch(`${API_BASE}/problems?learnerId=${encodeURIComponent(learnerId)}`);
    return handleResponse<ProblemWithCount[]>(res);
  },

  async getProblem(id: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    return handleResponse<Problem>(res);
  },

  async createAttempt(problemId: string, learnerId = 'demo-user'): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId, learnerId }),
    });
    return handleResponse<Attempt>(res);
  },

  async getAttempts(learnerId = 'demo-user'): Promise<AttemptDetail[]> {
    const res = await fetch(`${API_BASE}/attempts?learnerId=${encodeURIComponent(learnerId)}`);
    return handleResponse<AttemptDetail[]>(res);
  },

  async getAttempt(id: string): Promise<AttemptDetail> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    return handleResponse<AttemptDetail>(res);
  },

  async submitSolution(
    attemptId: string,
    submission: {
      assumptions: string;
      classes: string;
      relationships: string;
      abstractions: string;
      designDecisions: string;
      edgeCases: string;
    }
  ): Promise<{ attempt: Attempt; submission: Submission }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    return handleResponse<{ attempt: Attempt; submission: Submission }>(res);
  },

  async getEvaluation(attemptId: string): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/evaluation`);
    return handleResponse<Evaluation>(res);
  },

  async retryEvaluation(attemptId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/evaluate`, {
      method: 'POST',
    });
    return handleResponse<{ message: string }>(res);
  },

  async toggleSimulateFailure(fail: boolean): Promise<{ simulateFailure: boolean }> {
    const res = await fetch(`${API_BASE}/attempts/simulate-failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fail }),
    });
    return handleResponse<{ simulateFailure: boolean }>(res);
  },
};
