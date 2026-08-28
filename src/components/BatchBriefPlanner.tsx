'use client';

import { useMemo, useState } from 'react';

type Platform = 'shorts' | 'reels' | 'tiktok' | 'linkedin';
type Goal = 'announce' | 'educate' | 'demo' | 'convert';

const PLATFORM_LABELS: Record<Platform, string> = {
  shorts: 'YouTube Shorts',
  reels: 'Instagram Reels',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
};

const GOAL_LABELS: Record<Goal, string> = {
  announce: 'Launch announcement',
  educate: 'Teach one insight',
  demo: 'Product demo',
  convert: 'Drive signup',
};

const PLATFORM_DEFAULTS: Record<Platform, { ratio: string; duration: string; caption: string; hook: string }> = {
  shorts: {
    ratio: '9:16',
    duration: '35-45 sec',
    caption: 'High-contrast center captions with a payoff line every 6-8 seconds.',
    hook: 'Start with the result first, then show the before/after proof.',
  },
  reels: {
    ratio: '9:16',
    duration: '20-35 sec',
    caption: 'Big readable captions, soft background blur, and 1-2 emoji callouts max.',
    hook: 'Open on a relatable pain point before the product reveal.',
  },
  tiktok: {
    ratio: '9:16',
    duration: '18-30 sec',
    caption: 'Fast punchline captions with jump cuts and pattern interrupts.',
    hook: 'Use a direct challenge, mistake, or contrarian line in the first 2 seconds.',
  },
  linkedin: {
    ratio: '4:5',
    duration: '45-60 sec',
    caption: 'Clean lower-third captions with proof points and a final CTA card.',
    hook: 'Lead with the business lesson or metric before the walkthrough.',
  },
};

const GOAL_STEPS: Record<Goal, string[]> = {
  announce: ['Name the change', 'Show the fastest visual proof', 'Invite people to try it today'],
  educate: ['Promise one useful takeaway', 'Break it into 3 beats', 'End with a reusable checklist'],
  demo: ['State the workflow', 'Show the click-by-click transformation', 'Close on saved time'],
  convert: ['Agitate the current cost', 'Show the better path', 'Ask for one low-friction action'],
};

export function BatchBriefPlanner() {
  const [platform, setPlatform] = useState<Platform>('shorts');
  const [goal, setGoal] = useState<Goal>('demo');
  const [topic, setTopic] = useState('Turn a raw founder screen recording into 3 launch clips');

  const plan = useMemo(() => {
    const preset = PLATFORM_DEFAULTS[platform];
    const beats = GOAL_STEPS[goal];

    return {
      title: `${PLATFORM_LABELS[platform]} brief: ${GOAL_LABELS[goal]}`,
      specs: [`Aspect: ${preset.ratio}`, `Length: ${preset.duration}`, preset.caption],
      shotList: [
        `Hook: ${preset.hook}`,
        `A-roll: ${topic || 'Record the core talking-head explanation'}`,
        `B-roll: product UI, result preview, and one proof screenshot`,
        `CTA: ${goal === 'convert' ? 'Join the waitlist or book a demo' : 'Save the clip and remix it for the next platform'}`,
      ],
      script: beats.map((beat, index) => `${index + 1}. ${beat}`),
    };
  }, [goal, platform, topic]);

  const copyPlan = async () => {
    const text = [
      plan.title,
      '',
      'Specs:',
      ...plan.specs.map((item) => `- ${item}`),
      '',
      'Shot list:',
      ...plan.shotList.map((item) => `- ${item}`),
      '',
      'Script beats:',
      ...plan.script.map((item) => `- ${item}`),
    ].join('\n');

    await navigator.clipboard.writeText(text);
  };

  return (
    <section className="mt-8 sm:mt-10 bg-black/30 border border-white/10 backdrop-blur rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <p className="text-pink-300 text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-2">Batch planner</p>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Plan a multi-platform brief before rendering</h3>
          <p className="text-white/60 text-sm sm:text-base mt-2 max-w-2xl">
            Pick a channel and content goal to generate specs, script beats, b-roll needs, and a CTA that can be copied into the AI editor.
          </p>
        </div>
        <button
          type="button"
          onClick={copyPlan}
          className="px-4 py-3 bg-white text-indigo-950 rounded-xl font-semibold hover:bg-white/90 active:scale-[0.98] transition"
        >
          📋 Copy brief
        </button>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5 sm:gap-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-white/70 text-sm font-medium">Topic or raw clip idea</span>
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 w-full min-h-28 rounded-xl bg-white/10 border border-white/10 p-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Describe the recording, launch, tutorial, or product moment..."
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-white/70 text-sm font-medium">Platform</span>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value as Platform)}
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-indigo-950">
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-white/70 text-sm font-medium">Goal</span>
              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value as Goal)}
                className="mt-2 w-full rounded-xl bg-white/10 border border-white/10 p-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value} className="bg-indigo-950">
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 sm:p-5">
          <h4 className="text-lg font-semibold text-white mb-4">{plan.title}</h4>
          <BriefList title="Specs" items={plan.specs} />
          <BriefList title="Shot list" items={plan.shotList} />
          <BriefList title="Script beats" items={plan.script} />
        </div>
      </div>
    </section>
  );
}

function BriefList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mb-4 last:mb-0">
      <h5 className="text-white/90 text-sm font-semibold mb-2">{title}</h5>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-white/65 text-sm leading-relaxed flex gap-2">
            <span className="text-pink-300">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
