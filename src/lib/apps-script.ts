import { AssessmentRecord } from '@/lib/types';

function getEnv() {
  const url = process.env.GSCRIPT_URL;
  const token = process.env.GSCRIPT_TOKEN;

  if (!url) throw new Error('Missing GSCRIPT_URL');
  if (!token) throw new Error('Missing GSCRIPT_TOKEN');

  return { url, token };
}

async function callAppsScript<T>(action: string, payload?: Record<string, unknown>): Promise<T> {
  const { url, token } = getEnv();

  const response = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-gscript-token': token,
    },
    body: JSON.stringify({
      action,
      token,
      ...(payload || {}),
    }),
  });

  const text = await response.text();

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Apps Script respondió algo no JSON: ${text.slice(0, 180)}`);
  }

  if (!response.ok || json?.ok === false) {
    throw new Error(json?.error || 'No se pudo completar la operación con Apps Script.');
  }

  return json;
}

export async function createAssessment(item: AssessmentRecord) {
  return callAppsScript<{ ok: true; item: AssessmentRecord }>('createAssessment', {
    userId: item.userId,
    agency: item.agency,
    item,
  });
}

export async function listAssessments(agency?: string) {
  return callAppsScript<{ ok: true; items: AssessmentRecord[] }>('listAssessments', agency ? { agency } : {});
}

export async function getAssessmentById(id: string) {
  const data = await callAppsScript<{ ok: true; item: AssessmentRecord | null }>('getAssessment', { id });
  return data.item;
}
