'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { signInAction, signUpAction } from '@/app/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Please wait...' : text}
    </Button>
  );
}

export function AuthForm() {
  const [signUpState, signUpFormAction] = useFormState(signUpAction, { error: '' });
  const [signInState, signInFormAction] = useFormState(signInAction, { error: '' });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signUpFormAction} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signup-password">Password</Label>
              <Input id="signup-password" name="password" type="password" minLength={6} required />
            </div>
            {signUpState?.error ? <p className="text-sm text-red-600">{signUpState.error}</p> : null}
            <SubmitButton text="Sign up" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signInFormAction} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" name="email" type="email" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="signin-password">Password</Label>
              <Input id="signin-password" name="password" type="password" minLength={6} required />
            </div>
            {signInState?.error ? <p className="text-sm text-red-600">{signInState.error}</p> : null}
            <SubmitButton text="Sign in" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
