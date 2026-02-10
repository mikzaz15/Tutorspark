export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  skill_id: string;
  prompt: string;
  choices: Choice[];
  correct_choice: string;
  difficulty: number;
  explanation: string;
};

export type AttemptInput = {
  userId: string;
  questionId: string;
  skillId: string;
  attemptType: 'diagnostic' | 'practice';
  selectedChoice: string;
  isCorrect: boolean;
  timeSpentSec: number;
};
