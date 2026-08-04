'use client';

import { useMemo, useState } from 'react';

type Platform = 'tiktok' | 'reels' | 'shorts' | 'linkedin';
type Goal = 'awareness' | 'leads' | 'education' | 'launch';
type Tone = 'direct' | 'story' | 'expert' | 'playful';

const platformOptions: Record<Platform, { label: string; format: string; watchout: string }> = {
  tiktok: {
    label: 'TikTok',
    format: '9:16, fast pattern interrupts, captions on every beat',
    watchout: 'Make the first 2 seconds visually obvious without audio.',
  },
  reels: {
    label: 'Instagram Reels',
    format: '9:16, polished hook, punchy visual rhythm',
    watchout: 'Keep overlays short enough to read on a phone.',
  },
  shorts: {
    label: 'YouTube Shorts',
    format: '9:16, search-friendly title idea, strong retention loop',
    watchout: 'Promise one outcome and deliver it before the final CTA.',
  },
  linkedin: {
    label: 'LinkedIn',
    format: '4:5 or 1:1, professional captions, credibility proof',
    watchout: 'Lead with business pain and avoid creator jargon.',
  },
};

const goalOptions: Record<Goal, { label: string; cta: string; proof: string }> = {
  awareness: {
    label: 'Awareness',
    cta: 'Follow for the next teardown',
    proof: 'Show the before/after or surprising takeaway early.',
  },
  leads: {
    label: 'Lead capture',
    cta: 'Comment “brief” or tap the link to get the checklist',
    proof: 'Name the cost of the problem and the quick win.',
  },
  education: {
    label: 'Education',
    cta: 'Save this before your next edit',
    proof: 'Use a numbered framework viewers can repeat.',
  },
  launch: {
    label: 'Launch',
    cta: 'Join the waitlist / try the beta today',
    proof: 'Make the new capability concrete with a mini demo.',
  },
};

const toneOptions: Record<Tone, { label: string; hook: string; style: string }> = {
  direct: {
    label: 'Direct',
    hook: 'Stop editing like this if you want the video to convert.',
    style: 'Short sentences, clear contrast, no filler.',
  },
  story: {
    label: 'Story-led',
    hook: 'I almost deleted this clip, then it became the best part of the video.',
    style: 'Open loop, conflict, payoff, then lesson.',
  },
  expert: {
    label: 'Expert',
    hook: 'Here is the edit decision most creators skip before they render.',
    style: 'Specific diagnosis, credible language, practical takeaway.',
  },
  playful: {
    label: 'Playful',
    hook: 'Your video called. It wants better b-roll.',
    style: 'Light humor, vivid labels, energetic captions.',
  },
};

export function CreatorBriefBuilder() {
  const [platform, setPlatform] = useState<Platform>('reels');
  const [goal, setGoal] = useState<Goal>('leads');
  const [tone, setTone] = useState<Tone>('direct');
  const [topic, setTopic] = useState('Turn one talking-head clip into three short-form assets');
  const [audience, setAudience] = useState('solo creators and founder-led brands');
  const [copied, setCopied] = useState(false);

  const brief = useMemo(() => {
    const selectedPlatform = platformOptions[platform];
    const selectedGoal = goalOptions[goal];
    const selectedTone = toneOptions[tone];

    return [
      `Video brief for ${selectedPlatform.label}`,
      `Topic: ${topic}`,
      `Audience: ${audience}`,
      `Goal: ${selectedGoal.label}`,
      `Tone: ${selectedTone.label} — ${selectedTone.style}`,
      `Hook: ${selectedTone.hook}`,
      `Structure: hook → problem → proof/demo → 3 edit beats → CTA`,
      `Format: ${selectedPlatform.format}`,
      `Proof point: ${selectedGoal.proof}`,
      `CTA: ${selectedGoal.cta}`,
      `B-roll notes: show the raw clip, timeline edits, caption pass, and final export preview.`,
      `Caption notes: 6-9 words per line, emphasize the transformation words, keep contrast high.`,
      `Watchout: ${selectedPlatform.watchout}`,
    ].join('\n');
  }, [audience, goal, platform, tone, topic]);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Pre-production</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Creator Brief Builder</h2>
        <p className="mt-2 text-white/60">
          Turn a raw idea into a production-ready VibeCut prompt before you generate captions, b-roll, and export assets.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-white/80">Video topic</span>
          <textarea
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-indigo-400"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white/80">Audience</span>
          <textarea
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-indigo-400"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <BriefSelect label="Platform" value={platform} onChange={(value) => setPlatform(value as Platform)} options={platformOptions} />
        <BriefSelect label="Goal" value={goal} onChange={(value) => setGoal(value as Goal)} options={goalOptions} />
        <BriefSelect label="Tone" value={tone} onChange={(value) => setTone(value as Tone)} options={toneOptions} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white">Generated production brief</h3>
          <button
            type="button"
            onClick={copyBrief}
            className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            {copied ? 'Copied' : 'Copy brief'}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-sm leading-6 text-white/75">{brief}</pre>
      </div>
    </div>
  );
}

type BriefSelectProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: string) => void;
  options: Record<T, { label: string }>;
};

function BriefSelect<T extends string>({ label, value, onChange, options }: BriefSelectProps<T>) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white outline-none transition focus:border-indigo-400"
      >
        {(Object.keys(options) as T[]).map((optionValue) => (
          <option key={optionValue} value={optionValue} className="bg-gray-950">
            {options[optionValue].label}
          </option>
        ))}
      </select>
    </label>
  );
}
