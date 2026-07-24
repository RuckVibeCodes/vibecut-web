'use client';

import { useMemo, useState } from 'react';

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'linkedin';
type Tone = 'educational' | 'launch' | 'story' | 'proof';

const platformGuides: Record<Platform, { label: string; icon: string; limit: number; cta: string; format: string }> = {
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    limit: 2200,
    cta: 'Follow for the full breakdown.',
    format: 'Hook-first caption + 3-5 niche hashtags',
  },
  instagram: {
    label: 'Instagram Reels',
    icon: '📷',
    limit: 2200,
    cta: 'Save this before your next edit.',
    format: 'Value caption + save/share CTA',
  },
  youtube: {
    label: 'YouTube Shorts',
    icon: '▶️',
    limit: 100,
    cta: 'Watch the full workflow on the channel.',
    format: 'Short title-style caption + one search phrase',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: '💼',
    limit: 3000,
    cta: 'Comment with the workflow you want next.',
    format: 'Outcome-led post + practical takeaway',
  },
};

const toneGuides: Record<Tone, { label: string; hookPrefix: string; angle: string }> = {
  educational: {
    label: 'Educational',
    hookPrefix: 'Most creators miss this',
    angle: 'teach the repeatable editing move behind the clip',
  },
  launch: {
    label: 'Launch',
    hookPrefix: 'I built this so you can',
    angle: 'show the new capability and why it saves production time',
  },
  story: {
    label: 'Founder Story',
    hookPrefix: 'The messy part of making videos is',
    angle: 'turn the clip into a relatable before-and-after story',
  },
  proof: {
    label: 'Proof / Results',
    hookPrefix: 'Here is the result after',
    angle: 'lead with the measurable outcome and the steps that produced it',
  },
};

const fallbackTopics = [
  'AI captions that keep viewers watching',
  'B-roll that matches the speaker without a manual search',
  'turning one recording into platform-ready clips',
];

const defaultHashtags: Record<Platform, string[]> = {
  tiktok: ['#aitools', '#contentcreator', '#videotips', '#creatorworkflow'],
  instagram: ['#reelsstrategy', '#contentworkflow', '#aivideo', '#creatorbusiness'],
  youtube: ['#Shorts', '#VideoEditing', '#AITools'],
  linkedin: ['#CreatorEconomy', '#VideoMarketing', '#AIWorkflow'],
};

function splitTopics(raw: string) {
  return raw
    .split(/[\n,]/)
    .map((topic) => topic.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function SharePackGenerator() {
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [tone, setTone] = useState<Tone>('educational');
  const [videoTopic, setVideoTopic] = useState('How AI turns one talking-head recording into polished short-form clips');
  const [audience, setAudience] = useState('busy founders and solo creators');
  const [keywords, setKeywords] = useState('AI video editing, captions, B-roll, short-form workflow');

  const sharePack = useMemo(() => {
    const guide = platformGuides[platform];
    const toneGuide = toneGuides[tone];
    const topics = splitTopics(keywords).length ? splitTopics(keywords) : fallbackTopics;
    const primaryTopic = videoTopic.trim() || fallbackTopics[0];
    const audienceLabel = audience.trim() || 'creators';
    const hashtagSeed = topics.map((topic) => `#${titleCase(topic).replace(/[^A-Za-z0-9]/g, '')}`).filter((tag) => tag.length > 1);
    const hashtags = Array.from(new Set([...hashtagSeed, ...defaultHashtags[platform]])).slice(0, platform === 'youtube' ? 3 : 6);

    const hook = `${toneGuide.hookPrefix}: ${primaryTopic.toLowerCase()}.`;
    const body = [
      hook,
      `This clip is for ${audienceLabel}: ${toneGuide.angle}.`,
      `Use it to spotlight ${topics.slice(0, 3).join(', ')} without sending viewers to a long tutorial first.`,
      guide.cta,
    ];

    const caption = platform === 'youtube'
      ? `${titleCase(primaryTopic).slice(0, 86)} #Shorts`
      : `${body.join('\n\n')}\n\n${hashtags.join(' ')}`;

    const titles = [
      `${titleCase(primaryTopic).slice(0, 54)}`,
      `Stop Editing ${audienceLabel === 'creators' ? 'Manually' : 'Like It Is 2020'}`,
      `${platformGuides[platform].icon} ${titleCase(topics[0] || fallbackTopics[0]).slice(0, 46)}`,
    ];

    const checklist = [
      `Open with the strongest before/after frame in the first 1.5 seconds.`,
      `Pin the caption style to the ${platformGuides[platform].label} safe zone before export.`,
      `Mention ${topics[0] || 'the workflow'} on-screen and in the first caption line.`,
      `Export a ${platformGuides[platform].label} version, then duplicate the project before testing another hook.`,
    ];

    return { caption, titles, hashtags, checklist, guide };
  }, [audience, keywords, platform, tone, videoTopic]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Share Pack Generator</h2>
        <p className="text-white/60">
          Turn a finished edit into platform-ready titles, captions, hashtags, and final preflight notes before publishing.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Video topic</label>
            <textarea
              value={videoTopic}
              onChange={(event) => setVideoTopic(event.target.value)}
              rows={3}
              className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
              placeholder="What is this clip about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Audience</label>
            <input
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
              placeholder="Who should watch?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Keywords or beats</label>
            <textarea
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              rows={3}
              className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-400"
              placeholder="Comma-separated keywords, hooks, or scenes"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Platform</label>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value as Platform)}
                className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-indigo-400"
              >
                {Object.entries(platformGuides).map(([id, guide]) => (
                  <option key={id} value={id} className="bg-gray-950">
                    {guide.icon} {guide.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Tone</label>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value as Tone)}
                className="w-full rounded-xl bg-black/30 border border-white/10 p-3 text-white focus:outline-none focus:border-indigo-400"
              >
                {Object.entries(toneGuides).map(([id, guide]) => (
                  <option key={id} value={id} className="bg-gray-950">
                    {guide.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-indigo-200/80">Recommended format</p>
                <h3 className="text-xl font-semibold text-white">{sharePack.guide.icon} {sharePack.guide.label}</h3>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{sharePack.guide.limit.toLocaleString()} char limit</span>
            </div>
            <p className="text-white/70 text-sm">{sharePack.guide.format}</p>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-5">
            <h3 className="text-white font-semibold mb-3">Caption draft</h3>
            <pre className="whitespace-pre-wrap text-sm leading-6 text-white/80 font-sans">{sharePack.caption}</pre>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-white font-semibold mb-3">Title options</h3>
              <ul className="space-y-2">
                {sharePack.titles.map((title) => (
                  <li key={title} className="rounded-lg bg-black/20 px-3 py-2 text-sm text-white/75">{title}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-white font-semibold mb-3">Publish checklist</h3>
              <ul className="space-y-2">
                {sharePack.checklist.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-white/70">
                    <span className="text-emerald-300">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sharePack.hashtags.map((hashtag) => (
              <span key={hashtag} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/60">{hashtag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
