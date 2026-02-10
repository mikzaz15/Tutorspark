import { AuthForm } from '@/components/auth-form';

export default function AuthPage() {
  return (
    <main className="min-h-screen p-6">
      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold">Welcome to TutorSpark</h1>
        <p className="text-muted-foreground">Sign up or sign in to continue.</p>
        <AuthForm />
      </section>
    </main>
  );
}
