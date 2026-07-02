#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requestedFile = process.argv.find((arg) => arg.startsWith('--file='))?.slice('--file='.length);
const envFiles = requestedFile
  ? [requestedFile]
  : ['.env.local', '.env'];

const parsed = {};
const loadedFiles = [];

for (const file of envFiles) {
  const filePath = path.resolve(root, file);
  if (!existsSync(filePath)) continue;
  loadedFiles.push(file);
  const contents = readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    parsed[key] = stripQuotes(rawValue.trim());
  }
}

const env = { ...parsed, ...process.env };
const errors = [];
const warnings = [];
const notes = [];

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function valueOf(key) {
  return env[key]?.trim?.() ?? '';
}

function isMissing(key) {
  const value = valueOf(key);
  return !value || /^(changeme|change-me|todo|placeholder|example|xxx)$/i.test(value) || /^your[-_]/i.test(value);
}

function validateUrl(key, { required = false, https = true } = {}) {
  if (isMissing(key)) {
    if (required) errors.push(`${key} is required.`);
    return;
  }
  try {
    const url = new URL(valueOf(key));
    if (https && url.protocol !== 'https:') {
      warnings.push(`${key} should use https in deployed environments.`);
    }
  } catch {
    errors.push(`${key} must be a valid URL.`);
  }
}

function requireTogether(keys, label) {
  const present = keys.filter((key) => !isMissing(key));
  if (present.length > 0 && present.length < keys.length) {
    errors.push(`${label} is partially configured; set ${keys.filter(isMissing).join(', ')} or remove the partial config.`);
  }
  return present.length === keys.length;
}

const lambdaConfigured = requireTogether(
  ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'REMOTION_LAMBDA_FUNCTION', 'REMOTION_S3_BUCKET'],
  'Remotion Lambda rendering'
);

if (!isMissing('AWS_REGION') && !/^[a-z]{2}-[a-z]+-\d$/.test(valueOf('AWS_REGION'))) {
  warnings.push('AWS_REGION does not look like an AWS region (example: us-east-1).');
}

if (!isMissing('REMOTION_SERVE_URL')) {
  validateUrl('REMOTION_SERVE_URL');
} else if (lambdaConfigured) {
  warnings.push('REMOTION_SERVE_URL is not set; production renders will use the hard-coded fallback URL.');
}

if (!lambdaConfigured) {
  notes.push('Remotion Lambda is not fully configured; render jobs will use the local/demo simulation path.');
}

const clientKeys = [
  ['OpenAI', 'openai', /^sk-/],
  ['Anthropic', 'anthropic', /^sk-ant-/],
  ['ElevenLabs', 'elevenlabs', /^xi-/],
  ['Replicate', 'replicate', /^r8_/],
  ['Deepgram', 'deepgram', null],
  ['WaveSpeed AI', 'wavespeed', null],
];
notes.push('Provider API keys for AI tools are browser-local settings saved from /settings, not server env vars.');

for (const [label, key, pattern] of clientKeys) {
  const envKey = `VIBECUT_${key.toUpperCase()}_API_KEY`;
  if (!isMissing(envKey)) {
    warnings.push(`${envKey} is set, but VibeCut currently reads the ${label} key from browser localStorage via /settings.`);
    if (pattern && !pattern.test(valueOf(envKey))) {
      warnings.push(`${envKey} does not match the expected ${label} key prefix.`);
    }
  }
}

console.log('VibeCut environment readiness check');
console.log(`Loaded files: ${loadedFiles.length ? loadedFiles.join(', ') : 'none (using process environment only)'}`);

if (errors.length) {
  console.log('\nErrors:');
  for (const error of errors) console.log(`  ✖ ${error}`);
}

if (warnings.length) {
  console.log('\nWarnings:');
  for (const warning of warnings) console.log(`  ⚠ ${warning}`);
}

if (notes.length) {
  console.log('\nNotes:');
  for (const note of notes) console.log(`  • ${note}`);
}

if (!errors.length && !warnings.length) {
  console.log('\n✓ No environment problems found.');
} else if (!errors.length) {
  console.log('\n✓ No blocking environment problems found.');
}

process.exit(errors.length ? 1 : 0);
