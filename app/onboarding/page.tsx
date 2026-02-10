import { saveGradeAction, signOutAction } from '@/app/actions';
import { requireUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function OnboardingPage() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('grade')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pick your grade</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveGradeAction} className="space-y-4">
              <select
                name="grade"
                defaultValue={profile?.grade ?? ''}
                className="h-10 w-full rounded-md border border-input bg-white px-3"
                required
              >
                <option value="" disabled>
                  Select grade
                </option>
                {Array.from({ length: 13 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i === 0 ? 'Kindergarten' : `Grade ${i}`}
                  </option>
                ))}
              </select>
              <Button type="submit">Start Diagnostic</Button>
            </form>
          </CardContent>
        </Card>
        <form action={signOutAction}>
          <Button variant="outline">Sign out</Button>
        </form>
      </section>
    </main>
  );
}
