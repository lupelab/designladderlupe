import crypto from 'crypto';
import { cookies } from 'next/headers';
import { AGENCIES } from '@/lib/questionnaire';
import { AgencyName } from '@/lib/types';

export const AGENCY_COOKIE_NAME = 'designladder_agency';
export const ADMIN_COOKIE_NAME = 'designladder_admin';

function getAgencyPasswordMap(): Record<AgencyName, string> {
  return {
    ROGER: process.env.AGENCY_PASSWORD_ROGER || '',
    LUPE: process.env.AGENCY_PASSWORD_LUPE || '',
    AMPLIFY: process.env.AGENCY_PASSWORD_AMPLIFY || '',
    OMD: process.env.AGENCY_PASSWORD_OMD || '',
    NASTA: process.env.AGENCY_PASSWORD_NASTA || '',
    BRICK: process.env.AGENCY_PASSWORD_BRICK || '',
    ROW: process.env.AGENCY_PASSWORD_ROW || '',
    BPR: process.env.AGENCY_PASSWORD_BPR || '',
  };
}

function getAgencySessionSecret() {
  const secret = process.env.AGENCY_SESSION_SECRET;
  if (!secret) throw new Error('Missing AGENCY_SESSION_SECRET');
  return secret;
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('Missing ADMIN_SESSION_SECRET');
  return secret;
}

function signValue(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function makeAgencyCookieValue(agency: AgencyName) {
  const signature = signValue(agency, getAgencySessionSecret());
  return `${agency}.${signature}`;
}

export function parseAgencyCookie(raw?: string | null): AgencyName | null {
  if (!raw) return null;

  const [agency, signature] = raw.split('.');
  if (!agency || !signature) return null;
  if (!AGENCIES.includes(agency as AgencyName)) return null;

  const expected = signValue(agency, getAgencySessionSecret());
  if (signature !== expected) return null;

  return agency as AgencyName;
}

export function validateAgencyCredentials(
  agency: string,
  password: string
): agency is AgencyName {
  const normalized = agency.toUpperCase();
  if (!AGENCIES.includes(normalized as AgencyName)) return false;

  const passwordMap = getAgencyPasswordMap();
  return passwordMap[normalized as AgencyName] === password;
}

export async function getCurrentAgency(): Promise<AgencyName | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AGENCY_COOKIE_NAME)?.value;
  return parseAgencyCookie(raw);
}

export function validateAdminToken(token: string) {
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

export function makeAdminCookieValue() {
  const value = 'admin';
  const signature = signValue(value, getAdminSessionSecret());
  return `${value}.${signature}`;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!raw) return false;

  const [value, signature] = raw.split('.');
  if (value !== 'admin') return false;

  const expected = signValue(value, getAdminSessionSecret());
  return signature === expected;
}
