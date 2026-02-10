import { QuizRunner } from '@/components/quiz-runner';
import { requireUser } from '@/lib/auth';
import { getPracticeQuestionPool, getSingleSkill } from '@/lib/data';

export default async function PracticePage() {
  await requireUser();
  const skill = await getSingleSkill();
  const questions = await getPracticeQuestionPool(skill.id);

  return (
    <main className="min-h-screen p-6">
      <QuizRunner mode="practice" questions={questions} />
    </main>
  );
}
