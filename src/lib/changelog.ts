import OpenAI from 'openai';
import type { CommitSummary } from './github';
import type { RoadmapItem } from '@/db/schema';

// Nemotron 3 Ultra cez NVIDIA endpoint (OpenAI-compatible). Konfigurovateľné cez CHANGELOG_MODEL.
const MODEL = process.env.CHANGELOG_MODEL ?? 'nvidia/nemotron-3-ultra-550b-a55b';
const BASE_URL = process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1';
// Changelog je jednoduchá summarizácia — thinking je default OFF (rýchle/lacné).
// Zapni cez CHANGELOG_THINKING=true ak chceš kvalitnejšiu prózu za cenu latencie.
const THINKING = process.env.CHANGELOG_THINKING === 'true';

const SYSTEM = `Si asistent ktorý píše týždenné changelogy pre softvérové projekty.
Z GitHub commitov a stavu roadmapy vytvor stručný, čitateľný changelog v Markdown.
Pravidlá:
- Píš po slovensky.
- Začni nadpisom "## Týždeň <N> — <projekt>".
- Zoskup zmeny do logických sekcií (napr. Features, Fixes, Chore) podľa obsahu commitov; vynechaj prázdne sekcie.
- Každú položku napíš ako ľudsky čitateľnú vetu, nie raw commit message.
- Na konci pridaj sekciu "### Roadmap stav" s krátkym zhrnutím (% hotových, blokované úlohy s ich roadblockom).
- Žiadny úvod ani záver mimo changelogu. Vráť len Markdown.`;

export async function generateChangelogMarkdown(opts: {
  projectName: string;
  weekNumber: number;
  commits: CommitSummary[];
  roadmap: RoadmapItem[];
}): Promise<string> {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY nie je nastavené');
  }

  const client = new OpenAI({ apiKey: process.env.NVIDIA_API_KEY, baseURL: BASE_URL });

  const commitsText = opts.commits.length
    ? opts.commits.map((c) => `- ${c.sha} ${c.message} (${c.author})`).join('\n')
    : '(žiadne commity za posledných 7 dní)';

  const roadmapText = opts.roadmap.length
    ? opts.roadmap
        .map(
          (r) =>
            `- [${r.status}, ${r.progressPercentage}%] ${r.title}` +
            (r.status === 'blocked' && r.roadblockDescription
              ? ` — roadblock: ${r.roadblockDescription}`
              : ''),
        )
        .join('\n')
    : '(žiadne roadmap items)';

  const prompt = `Projekt: ${opts.projectName}
Číslo týždňa: ${opts.weekNumber}

GitHub commity (posledných 7 dní):
${commitsText}

Roadmap stav:
${roadmapText}`;

  // reasoning_budget a chat_template_kwargs sú NVIDIA-specific passthrough params (mimo OpenAI typov)
  const params: Record<string, unknown> = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt },
    ],
    temperature: 1,
    top_p: 0.95,
    max_tokens: 8192,
    chat_template_kwargs: { enable_thinking: THINKING },
  };
  if (THINKING) params.reasoning_budget = 8192;

  const completion = await client.chat.completions.create(
    params as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  );

  const markdown = completion.choices[0]?.message?.content?.trim();
  if (!markdown) throw new Error('model nevrátil žiadny obsah');
  return markdown;
}

/** ISO 8601 číslo týždňa pre daný dátum. */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Po=1..Ne=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // posun na štvrtok daného týždňa
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
