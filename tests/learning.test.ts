import { describe, expect, it } from 'vitest';
import {
  buildAttempt,
  computeMastery,
  selectDiagnosticQuestions,
  selectPracticeQuestionsAdaptive
} from '@/lib/learning';
import type { Question } from '@/lib/types';

function makeQuestions(): Question[] {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `q-${i + 1}`,
    skill_id: '11111111-1111-1111-1111-111111111111',
    prompt: `Question ${i + 1}`,
    choices: [
      { id: 'A', text: 'A' },
      { id: 'B', text: 'B' },
      { id: 'C', text: 'C' },
      { id: 'D', text: 'D' }
    ],
    correct_choice: 'A',
    difficulty: (i % 5) + 1,
    explanation: 'Because.'
  }));
}

describe('auth gating matcher', () => {
  it('uses protected matcher for required routes', async () => {
    const { config } = await import('@/middleware');
    expect(config.matcher).toEqual([
      '/onboarding/:path*',
      '/diagnostic/:path*',
      '/practice/:path*',
      '/dashboard/:path*'
    ]);
  });
});

describe('attempt insert mapping', () => {
  it('maps attempt payload to db insert shape', () => {
    const attempt = buildAttempt({
      userId: 'u1',
      questionId: 'q1',
      skillId: 's1',
      attemptType: 'practice',
      selectedChoice: 'B',
      isCorrect: false,
      timeSpentSec: 14
    });

    expect(attempt).toEqual({
      user_id: 'u1',
      question_id: 'q1',
      skill_id: 's1',
      attempt_type: 'practice',
      selected_choice: 'B',
      is_correct: false,
      time_spent_sec: 14
    });
  });
});

describe('mastery update', () => {
  it('computes mastery from last attempts correctly', () => {
    const score = computeMastery([true, true, false, true]);
    expect(score).toBe(0.75);
  });
});

describe('diagnostic selection', () => {
  it('returns 5 questions only from difficulty 1-3', () => {
    const selected = selectDiagnosticQuestions(makeQuestions(), 5);
    expect(selected).toHaveLength(5);
    expect(selected.every((q) => q.difficulty >= 1 && q.difficulty <= 3)).toBe(true);
  });
});

describe('practice adaptive selection', () => {
  it('follows adaptive-lite progression and returns 5 distinct questions', () => {
    const selected = selectPracticeQuestionsAdaptive(makeQuestions(), [true, false, true, true, false], 5);
    expect(selected).toHaveLength(5);
    expect(new Set(selected.map((q) => q.id)).size).toBe(5);
  });
});
