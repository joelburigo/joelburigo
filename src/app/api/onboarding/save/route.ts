import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db/client';
import { user_profiles } from '@/server/db/schema';
import { getCurrentUser } from '@/server/services/session';
import {
  ONBOARDING_STEPS,
  TOTAL_STEPS,
  fieldsToMarkdown,
  findStepByPosition,
} from '@/components/features/onboarding/steps';

/**
 * POST /api/onboarding/save
 *
 * Persiste 1 step do onboarding 6Ps em `user_profiles`. Cada step grava em:
 *   - 1 coluna `*_md` (markdown estruturado, exibível)
 *   - `raw_data.steps[N]` (objeto cru pra reabrir o form com os mesmos campos)
 *
 * Body: { step: 1..6, data: { [fieldName]: string } }
 */

const bodySchema = z.object({
  step: z.number().int().min(1).max(TOTAL_STEPS),
  data: z.record(z.string()),
});

interface RawData {
  steps?: Record<string, Record<string, string>>;
  [k: string]: unknown;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'validation', issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const step = findStepByPosition(parsed.data.step);
  if (!step) {
    return NextResponse.json({ error: 'unknown_step' }, { status: 400 });
  }

  // Filtra só os fields conhecidos do step + sanitiza length por segurança
  const filtered: Record<string, string> = {};
  for (const field of step.fields) {
    const v = parsed.data.data[field.name];
    if (typeof v !== 'string') continue;
    filtered[field.name] = v.trim().slice(0, 4000);
  }

  const markdown = fieldsToMarkdown(step, filtered);

  try {
    const [existing] = await db
      .select()
      .from(user_profiles)
      .where(eq(user_profiles.user_id, user.id))
      .limit(1);

    const prevRaw = (existing?.raw_data ?? {}) as RawData;
    const prevSteps = prevRaw.steps ?? {};
    const nextRaw: RawData = {
      ...prevRaw,
      steps: {
        ...prevSteps,
        [String(step.position)]: filtered,
      },
    };

    if (existing) {
      await db
        .update(user_profiles)
        .set({
          [step.profileKey]: markdown,
          raw_data: nextRaw,
          updated_at: new Date(),
        })
        .where(eq(user_profiles.user_id, user.id));
    } else {
      await db.insert(user_profiles).values({
        user_id: user.id,
        [step.profileKey]: markdown,
        raw_data: nextRaw,
      });
    }

    // Conta quantos Ps já foram preenchidos pra UI saber se terminou
    const completedKeys = ONBOARDING_STEPS.filter((s) => {
      // Se for o step recém-salvo, sabemos que markdown não está vazio.
      if (s.position === step.position) return markdown.trim().length > 0;
      const v = existing?.[s.profileKey];
      return typeof v === 'string' && v.trim().length > 0;
    });

    return NextResponse.json({
      ok: true,
      step: step.position,
      completed_count: completedKeys.length,
      onboarded: completedKeys.length === TOTAL_STEPS,
    });
  } catch (err) {
    console.error('[api/onboarding/save]', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
