import crypto from 'crypto';
import { cookies } from 'next/headers';
import { AGENCIES } from '@/lib/questionnaire';
import { AccessSession, AgencyName, QualificationProgress } from '@/lib/types';

export const AGENCY_COOKIE_NAME = 'designladder_agency';
export const ACCESS_COOKIE_NAME = 'designladder_access';
export const ADMIN_COOKIE_NAME = 'designladder_admin';
export const QUALIFICATION_COOKIE_NAME = 'designladder_qualification';

function getAgencyPasswordMap(): Record<AgencyName, string> {
  return {
    ROGER: process.env.AGENCY_PASSWORD_ROGER || '',
    LUPE: process.env.AGENCY_PASSWORD_LUPE || '',
    AMPLIFY: process.env.AGENCY_PASSWORD_AMPLIFY || '',
    OMD: process.env.AGENCY_PASSWORD_OMD || '',
    PHD: process.env.AGENCY_PASSWORD_PHD || '',
    NASTA: process.env.AGENCY_PASSWORD_NASTA || '',
    BRICK: process.env.AGENCY_PASSWORD_BRICK || '',
    ROW: process.env.AGENCY_PASSWORD_ROW || '',
    BPR: process.env.AGENCY_PASSWORD_BPR || '',
    TEXO: process.env.AGENCY_PASSWORD_TEXO || '',
  };
}

function sessionSecret() {
  const secret = process.env.ACCESS_SESSION_SECRET || process.env.AGENCY_SESSION_SECRET;
  if (!secret) throw new Error('Missing ACCESS_SESSION_SECRET or AGENCY_SESSION_SECRET');
  return secret;
}

function adminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ACCESS_SESSION_SECRET;
  if (!secret) throw new Error('Missing ADMIN_SESSION_SECRET');
  return secret;
}

function signValue(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
    return safeEqual(candidate, hash);
  } catch {
    return false;
  }
}

export function makeAccessCookieValue(session: AccessSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = signValue(payload, sessionSecret());
  return `${payload}.${signature}`;
}

export function parseAccessCookie(raw?: string | null): AccessSession | null {
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  const expected = signValue(payload, sessionSecret());
  if (!safeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AccessSession;
    if (!session?.email || !session?.agency || !session?.role) return null;
    if (!AGENCIES.includes(session.agency)) return null;
    return session;
  } catch {
    return null;
  }
}


export function makeQualificationCookieValue(userId: string, progress: QualificationProgress) {
  const payload = Buffer.from(JSON.stringify({ userId, progress })).toString('base64url');
  const signature = signValue(payload, sessionSecret());
  return `${payload}.${signature}`;
}

export function parseQualificationCookie(raw?: string | null): { userId: string; progress: QualificationProgress } | null {
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  const expected = signValue(payload, sessionSecret());
  if (!safeEqual(signature, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed?.userId || !parsed?.progress) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function makeAgencyCookieValue(agency: AgencyName) {
  const signature = signValue(agency, sessionSecret());
  return `${agency}.${signature}`;
}

export function parseAgencyCookie(raw?: string | null): AgencyName | null {
  if (!raw) return null;
  const [agency, signature] = raw.split('.');
  if (!agency || !signature || !AGENCIES.includes(agency as AgencyName)) return null;
  const expected = signValue(agency, sessionSecret());
  return safeEqual(signature, expected) ? (agency as AgencyName) : null;
}

export function validateAgencyCredentials(agency: string, password: string): agency is AgencyName {
  const normalized = agency.toUpperCase();
  if (!AGENCIES.includes(normalized as AgencyName)) return false;
  const expected = getAgencyPasswordMap()[normalized as AgencyName];
  return Boolean(expected) && safeEqual(password, expected);
}

function hasValidAdminCookie(raw?: string | null) {
  if (!raw) return false;
  const [value, signature] = raw.split('.');
  if (value !== 'admin' || !signature) return false;
  return safeEqual(signature, signValue(value, adminSessionSecret()));
}

export async function getCurrentUser(): Promise<AccessSession | null> {
  const cookieStore = await cookies();
  const access = parseAccessCookie(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  if (access) return access;

  const legacyAgency = parseAgencyCookie(cookieStore.get(AGENCY_COOKIE_NAME)?.value);
  if (legacyAgency) {
    return {
      id: `legacy-${legacyAgency.toLowerCase()}`,
      fullName: `Equipo ${legacyAgency}`,
      email: `${legacyAgency.toLowerCase()}@legacy.local`,
      agency: legacyAgency,
      role: 'member',
      legacy: true,
    };
  }

  if (hasValidAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) {
    return {
      id: 'admin-preview',
      fullName: 'Administrador Adlens',
      email: 'adlens@lupe.com.py',
      agency: 'TEXO',
      role: 'admin',
      legacy: true,
      adminPreview: true,
    };
  }

  return null;
}

export async function getCurrentAgency(): Promise<AgencyName | null> {
  return (await getCurrentUser())?.agency || null;
}

export function validateAdminToken(token: string) {
  return Boolean(token && process.env.ADMIN_TOKEN && safeEqual(token, process.env.ADMIN_TOKEN));
}

export function makeAdminCookieValue() {
  const value = 'admin';
  const signature = signValue(value, adminSessionSecret());
  return `${value}.${signature}`;
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const access = parseAccessCookie(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  if (access?.role === 'admin') return true;
  return hasValidAdminCookie(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
