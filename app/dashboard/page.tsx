import Link from 'next/link';
import { signOutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/lib/auth';

export default async function DashboardPage() {
  const { user, supabase } = await requireUser();

  const [{ data: student }, { data: skill }, { data: attempts }, { data: mastery }, { data: diagnosticAttempts }] =
    await Promise.all([
      supabase.from('student_profiles').select('grade').eq('user_id', user.id).maybeSingle(),
      supabase.from('skills').select('id,name').limit(1).single(),
      supabase
        .from('attempts')
        .select('is_correct, created_at, selected_choice, attempt_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('mastery').select('mastery_score').eq('user_id', user.id).limit(1).maybeSingle(),
      supabase
        .from('attempts')
        .select('is_correct')
        .eq('user_id', user.id)
        .eq('attempt_type', 'diagnostic')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

  const recentAttempts = attempts ?? [];
  const diagnosticScore = (diagnosticAttempts ?? []).filter((a) => a.is_correct).length;

  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent>{student?.grade === 0 ? 'Kindergarten' : `Grade ${student?.grade ?? '—'}`}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last Diagnostic</CardTitle>
            </CardHeader>
            <CardContent>{diagnosticAttempts?.length ? `${diagnosticScore}/5` : '—'}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mastery Score</CardTitle>
            </CardHeader>
            <CardContent>{Math.round((mastery?.mastery_score ?? 0) * 100)}%</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attempts ({skill?.name ?? 'Skill'})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentAttempts.length === 0 ? <li>No attempts yet.</li> : null}
              {recentAttempts.map((attempt, idx) => (
                <li key={idx} className="rounded-md border p-2 text-sm">
                  {attempt.is_correct ? '✅ Correct' : '❌ Incorrect'} • {attempt.attempt_type} •{' '}
                  {new Date(attempt.created_at).toLocaleString()}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/practice">Practice Again</Link>
          </Button>
          <form action={signOutAction}>
            <Button variant="outline">Sign out</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
