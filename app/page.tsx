import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <section className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">TutorSpark</h1>
        <p className="text-lg text-muted-foreground">
          Build math confidence with quick diagnostics, guided practice, and mastery tracking.
        </p>
        <Button asChild size="lg">
          <Link href="/auth">Get Started</Link>
        </Button>
      </section>
    </main>
  );
}
