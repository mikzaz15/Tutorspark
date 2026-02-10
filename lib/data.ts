import { createSupabaseServerClient } from './supabase-server';
import { selectDiagnosticQuestions } from './learning';
import type { Question } from './types';

export async function getSingleSkill() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('skills').select('*').limit(1).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getQuestionsForSkill(skillId: string): Promise<Question[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('skill_id', skillId)
    .order('difficulty', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as Question[]) ?? [];
}

export async function getDiagnosticQuestions(skillId: string): Promise<Question[]> {
  const questions = await getQuestionsForSkill(skillId);
  return selectDiagnosticQuestions(questions, 5);
}

export async function getPracticeQuestionPool(skillId: string): Promise<Question[]> {
  return getQuestionsForSkill(skillId);
}
