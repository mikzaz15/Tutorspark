'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { computeMastery } from '@/lib/learning';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const attemptSchema = z.object({
  questionId: z.string().uuid(),
  skillId: z.string().uuid(),
  selectedChoice: z.string().min(1),
  attemptType: z.enum(['diagnostic', 'practice']),
  timeSpentSec: z.coerce.number().int().min(0).max(3600)
});

export async function signUpAction(_: { error: string }, formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) return { error: error.message };
  redirect('/onboarding');
}

export async function signInAction(_: { error: string }, formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect('/onboarding');
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function saveGradeAction(formData: FormData) {
  const grade = Number(formData.get('grade'));
  if (Number.isNaN(grade) || grade < 0 || grade > 12) {
    return { error: 'Please choose a grade from K-12.' };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { error } = await supabase
    .from('student_profiles')
    .upsert({ user_id: user.id, grade }, { onConflict: 'user_id' });

  if (error) return { error: error.message };
  revalidatePath('/dashboard');
  redirect('/diagnostic');
}

export async function submitAttemptAction(formData: FormData) {
  const parsed = attemptSchema.safeParse({
    questionId: formData.get('questionId'),
    skillId: formData.get('skillId'),
    selectedChoice: formData.get('selectedChoice'),
    attemptType: formData.get('attemptType'),
    timeSpentSec: formData.get('timeSpentSec') ?? 0
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid attempt payload' };
  }

  const { questionId, skillId, selectedChoice, attemptType, timeSpentSec } = parsed.data;

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: question } = await supabase
    .from('questions')
    .select('correct_choice')
    .eq('id', questionId)
    .single();

  if (!question) return { error: 'Question not found.' };

  const isCorrect = question.correct_choice === selectedChoice;

  const { error } = await supabase.from('attempts').insert({
    user_id: user.id,
    question_id: questionId,
    skill_id: skillId,
    attempt_type: attemptType,
    selected_choice: selectedChoice,
    is_correct: isCorrect,
    time_spent_sec: timeSpentSec
  });

  if (error) return { error: error.message };

  const { data: attempts } = await supabase
    .from('attempts')
    .select('is_correct')
    .eq('user_id', user.id)
    .eq('skill_id', skillId)
    .order('created_at', { ascending: false })
    .limit(10);

  const masteryScore = computeMastery((attempts ?? []).map((a) => a.is_correct));

  const { error: masteryError } = await supabase.from('mastery').upsert(
    {
      user_id: user.id,
      skill_id: skillId,
      mastery_score: masteryScore,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,skill_id' }
  );

  if (masteryError) return { error: masteryError.message };

  revalidatePath('/dashboard');
  return { success: true, isCorrect };
}
