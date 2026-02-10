'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitAttemptAction } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Question } from '@/lib/types';

type QuizRunnerProps = {
  mode: 'diagnostic' | 'practice';
  questions: Question[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function QuizRunner({ mode, questions }: QuizRunnerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);
  const [difficultyCursor, setDifficultyCursor] = useState(2);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() => {
    if (questions.length === 0) return null;
    if (mode === 'diagnostic') return questions[0];
    return questions.find((q) => q.difficulty === 2) ?? questions[0];
  });
  const [isPending, startTransition] = useTransition();
  const [startedAt] = useState(Date.now());

  const progress = useMemo(() => `${Math.min(index + 1, 5)} of 5`, [index]);

  if (!currentQuestion || index >= 5) {
    const score = results.filter(Boolean).length;
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{mode === 'diagnostic' ? 'Diagnostic complete!' : 'Practice complete!'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Score: {score}/5
          </p>
          <Button onClick={() => router.push(mode === 'diagnostic' ? '/practice' : '/dashboard')}>
            {mode === 'diagnostic' ? 'Continue to practice' : 'Go to dashboard'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pickNextPracticeQuestion = (nextDifficulty: number, consumedId: string) => {
    const excluded = new Set([...usedQuestionIds, consumedId]);
    const exactPool = questions.filter((q) => q.difficulty === nextDifficulty && !excluded.has(q.id));
    const fallbackPool = questions.filter((q) => !excluded.has(q.id));
    return exactPool[0] ?? fallbackPool[0] ?? null;
  };

  const handleSubmit = () => {
    if (!selectedChoice) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.append('questionId', currentQuestion.id);
      formData.append('skillId', currentQuestion.skill_id);
      formData.append('selectedChoice', selectedChoice);
      formData.append('attemptType', mode);
      formData.append('timeSpentSec', String(Math.floor((Date.now() - startedAt) / 1000)));
      const result = await submitAttemptAction(formData);

      if (result?.error) {
        setFeedback({ correct: false, explanation: result.error });
        return;
      }

      const correct = !!result?.isCorrect;
      setFeedback({ correct, explanation: currentQuestion.explanation });
      setResults((prev) => [...prev, correct]);
    });
  };

  const handleNext = () => {
    const consumedQuestion = currentQuestion;
    const newUsed = [...usedQuestionIds, consumedQuestion.id];
    setUsedQuestionIds(newUsed);

    if (mode === 'diagnostic') {
      const next = questions[index + 1] ?? null;
      setCurrentQuestion(next);
    } else {
      const lastCorrect = results[results.length - 1] ?? false;
      const nextDifficulty = clamp(difficultyCursor + (lastCorrect ? 1 : -1), 1, 5);
      setDifficultyCursor(nextDifficulty);
      setCurrentQuestion(pickNextPracticeQuestion(nextDifficulty, consumedQuestion.id));
    }

    setFeedback(null);
    setSelectedChoice('');
    setIndex((prev) => prev + 1);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{mode === 'diagnostic' ? 'Diagnostic' : 'Guided Practice'}</span>
          <span className="text-sm font-normal text-muted-foreground">Question {progress}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base">{currentQuestion.prompt}</p>
        <div className="space-y-2">
          {currentQuestion.choices.map((choice) => (
            <label key={choice.id} className="flex gap-2 rounded-md border p-3 cursor-pointer">
              <input
                type="radio"
                name="choice"
                value={choice.id}
                checked={selectedChoice === choice.id}
                onChange={(e) => setSelectedChoice(e.target.value)}
              />
              <span>{choice.text}</span>
            </label>
          ))}
        </div>

        {feedback ? (
          <div className={`rounded-md p-3 text-sm ${feedback.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p className="font-medium">{feedback.correct ? 'Correct!' : 'Not quite yet.'}</p>
            <p>{feedback.explanation}</p>
          </div>
        ) : null}

        {!feedback ? (
          <Button onClick={handleSubmit} disabled={!selectedChoice || isPending}>
            Submit
          </Button>
        ) : (
          <Button onClick={handleNext}>Next question</Button>
        )}
      </CardContent>
    </Card>
  );
}
