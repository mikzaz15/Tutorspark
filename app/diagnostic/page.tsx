import { QuizRunner } from '@/components/quiz-runner';
import { requireUser } from '@/lib/auth';
import { getDiagnosticQuestions, getSingleSkill } from '@/lib/data';

export default async function DiagnosticPage() {
  await requireUser();
  const skill = await getSingleSkill();
  const questions = await getDiagnosticQuestions(skill.id);

  return (
    <main className="min-h-screen p-6">
      <QuizRunner mode="diagnostic" questions={questions} />
    </main>
  );
}
