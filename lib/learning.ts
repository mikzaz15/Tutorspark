import { AttemptInput, Question } from './types';

export function selectDiagnosticQuestions(questions: Question[], total = 5): Question[] {
  const filtered = questions.filter((q) => q.difficulty >= 1 && q.difficulty <= 3);
  return shuffle(filtered).slice(0, total);
}

export function selectPracticeQuestionsAdaptive(
  questions: Question[],
  correctness: boolean[],
  total = 5
): Question[] {
  const selected: Question[] = [];
  const usedIds = new Set<string>();
  let difficulty = 2;

  for (let i = 0; i < total; i += 1) {
    const pool = questions.filter((q) => q.difficulty === difficulty && !usedIds.has(q.id));
    const fallback = questions.filter((q) => !usedIds.has(q.id));
    const picked = shuffle(pool).at(0) ?? shuffle(fallback).at(0);

    if (!picked) break;

    selected.push(picked);
    usedIds.add(picked.id);

    const answeredCorrect = correctness[i] ?? false;
    difficulty = clamp(difficulty + (answeredCorrect ? 1 : -1), 1, 5);
  }

  return selected;
}

export function computeMastery(lastAttemptsCorrectness: boolean[]): number {
  const latest = lastAttemptsCorrectness.slice(0, 10);
  const correct = latest.filter(Boolean).length;
  const denominator = latest.length >= 10 ? 10 : Math.max(1, latest.length);
  return clampNumber(correct / denominator, 0, 1);
}

export function buildAttempt(input: AttemptInput) {
  return {
    user_id: input.userId,
    question_id: input.questionId,
    skill_id: input.skillId,
    attempt_type: input.attemptType,
    is_correct: input.isCorrect,
    selected_choice: input.selectedChoice,
    time_spent_sec: input.timeSpentSec
  };
}

function shuffle<T>(arr: T[]) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
