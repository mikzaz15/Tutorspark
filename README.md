# TutorSpark MVP

TutorSpark is a K–12 tutoring MVP built with Next.js 14, TailwindCSS, shadcn-style UI primitives, and Supabase Auth/Postgres.

## Features Included

- Email/password sign up + sign in
- Protected onboarding, diagnostic, practice, dashboard routes
- Grade selection (K–12)
- Diagnostic flow (5 random questions difficulty 1–3)
- Guided practice flow (5 adaptive-lite questions that adjust difficulty after each answer)
- Attempt persistence + mastery score updates
- Dashboard with grade, recent attempts, and mastery
- Supabase SQL migration + seed (1 skill, 20 questions)
- Row Level Security policies for student data isolation
- 5 tests for key learning logic and route protection config

## Tech Stack

- Next.js 14 App Router + TypeScript
- TailwindCSS
- shadcn-inspired UI component structure (`components/ui`)
- Supabase (Auth + Postgres)
- Vitest for tests

## 1) Local Setup

```bash
git clone <your-repo-url>
cd Tutorspark
npm install
```

> If `npm install` fails in your environment, ensure registry/network access is available.

## 2) Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy:
   - Project URL
   - anon public key
3. In **SQL Editor**, run migration SQL from:
   - `db/migrations/001_init.sql`
4. Then run seed SQL from:
   - `db/seed/seed.sql`

## 3) Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> No service role key is used on the client.

## 4) Run App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5) MVP User Flow

1. Go to `/` and click **Get Started**
2. On `/auth`, sign up with email/password
3. On `/onboarding`, choose grade and start diagnostic
4. On `/diagnostic`, answer 5 questions
5. Continue to `/practice`, answer 5 adaptive questions
6. View `/dashboard` for grade, score, mastery, recent attempts

## Database Notes

`attempts` rows include `attempt_type` (`diagnostic` or `practice`) so dashboard metrics can report the last diagnostic accurately.

### Tables

- `profiles`
- `student_profiles`
- `skills`
- `questions`
- `attempts`
- `mastery`

### RLS

RLS is enabled and policies ensure users can only read/write their own:

- `student_profiles`
- `attempts`
- `mastery`

Users can read shared curriculum content:

- `skills`
- `questions`

## Testing

Run tests:

```bash
npm test
```

Current test coverage includes:

1. Auth gating matcher configuration
2. Attempt insert payload shape
3. Mastery score computation
4. Diagnostic question selection rules
5. Adaptive practice selection uniqueness/count

## Vercel Deployment

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add same env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

## Project Structure

```txt
app/
  actions.ts
  auth/page.tsx
  onboarding/page.tsx
  diagnostic/page.tsx
  practice/page.tsx
  dashboard/page.tsx
components/
  auth-form.tsx
  quiz-runner.tsx
  ui/*
lib/
  auth.ts
  data.ts
  learning.ts
  supabase-browser.ts
  supabase-server.ts
db/
  migrations/001_init.sql
  seed/seed.sql
tests/
  learning.test.ts
```

## Next Steps

1. Add more skills/subjects by extending `skills` + `questions` seed content (e.g., decimals, algebra, reading comprehension).
2. Add per-skill diagnostic routing (e.g., `/diagnostic/[skillId]`) and multi-skill dashboard charts.
3. Introduce teacher/parent roles and progress reports.
4. Add AI Tutor chat with guardrails:
   - Use retrieval over approved curriculum snippets.
   - Ask guiding questions instead of giving final answers.
   - Log interactions for educator review.
