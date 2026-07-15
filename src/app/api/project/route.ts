// VibeCut Project API
// CRUD operations for video projects

import { NextResponse } from 'next/server';
import ProjectStore from '@/lib/projectStore';
import type { Project } from '@/lib/types/project';

type JsonObject = Record<string, unknown>;
type ProjectUpdate = Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>;

const UPDATABLE_PROJECT_FIELDS = new Set<keyof ProjectUpdate>([
  'name',
  'sourceVideoUrl',
  'sourceVideoFile',
  'duration',
  'transcript',
  'transcriptEdited',
  'narrativeSections',
  'enhancementSuggestions',
  'captionStyle',
  'colorGrade',
  'cameraKeyframes',
  'brollClips',
  'textOverlays',
  'soundEffects',
  'musicTrack',
  'exports',
]);

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJsonObject(request: Request): Promise<JsonObject | NextResponse> {
  try {
    const body: unknown = await request.json();

    if (!isJsonObject(body)) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    return body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }
}

function getTrimmedString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

function sanitizeProjectUpdates(body: JsonObject): ProjectUpdate {
  return Object.fromEntries(
    Object.entries(body).filter(([key]) => UPDATABLE_PROJECT_FIELDS.has(key as keyof ProjectUpdate))
  ) as ProjectUpdate;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const project = ProjectStore.get(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  }

  // List all projects
  const projects = ProjectStore.list();
  return NextResponse.json({ success: true, projects });
}

export async function POST(request: Request) {
  const body = await readJsonObject(request);
  if (body instanceof NextResponse) return body;

  const name = getTrimmedString(body.name);

  if (!name) {
    return NextResponse.json({ error: 'Project name required' }, { status: 400 });
  }

  const project = ProjectStore.create(name);
  return NextResponse.json({ success: true, project });
}

export async function PUT(request: Request) {
  const body = await readJsonObject(request);
  if (body instanceof NextResponse) return body;

  const id = getTrimmedString(body.id);

  if (!id) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  const updates = sanitizeProjectUpdates(body);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No supported project updates provided' }, { status: 400 });
  }

  if ('name' in updates) {
    const name = getTrimmedString(updates.name);
    if (!name) {
      return NextResponse.json({ error: 'Project name cannot be blank' }, { status: 400 });
    }
    updates.name = name;
  }

  const project = ProjectStore.update(id, updates);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, project });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  const deleted = ProjectStore.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Project deleted' });
}
