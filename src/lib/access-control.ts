import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { hashPassword } from '@/lib/auth';
import { AccessStatus, AccessUser, AgencyName } from '@/lib/types';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapUser(row: any): AccessUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    agency: row.agency as AgencyName,
    role: row.role,
    jobTitle: row.job_title || undefined,
    status: row.status,
    requestedAt: row.requested_at,
    approvedAt: row.approved_at || undefined,
    lastLoginAt: row.last_login_at || undefined,
    mustChangePassword: Boolean(row.must_change_password),
    readinessCompletedAt: row.readiness_completed_at || undefined,
    guideCompletedAt: row.guide_completed_at || undefined,
    certificationStatus: row.certification_status || 'not_started',
    certificationScore: typeof row.certification_score === 'number' ? row.certification_score : undefined,
    certificationAttempts: Number(row.certification_attempts || 0),
    certifiedAt: row.certified_at || undefined,
  };
}

export async function findAccessUserByEmail(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('access_users')
    .select('*')
    .eq('email', normalizeEmail(email))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? { user: mapUser(data), passwordHash: data.password_hash as string } : null;
}

export async function createAccessRequest(input: {
  fullName: string;
  email: string;
  agency: AgencyName;
  jobTitle?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('access_users')
    .insert({
      full_name: input.fullName.trim(),
      email: normalizeEmail(input.email),
      agency: input.agency,
      job_title: input.jobTitle?.trim() || null,
      // La cuenta se solicita sin contraseña. Este secreto aleatorio nunca se entrega
      // y será reemplazado por una clave temporal cuando el administrador apruebe.
      password_hash: hashPassword(crypto.randomBytes(32).toString('hex')),
      role: 'member',
      status: 'pending',
      must_change_password: true,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe una cuenta o solicitud con ese email.');
    throw new Error(error.message);
  }
  return mapUser(data);
}

export async function listAccessUsers() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('access_users')
    .select('*')
    .order('requested_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapUser);
}

function createTemporaryPassword() {
  return `Texo-${crypto.randomBytes(4).toString('hex')}!`;
}

export async function approveAccessUser(id: string, approvedBy?: string) {
  const supabase = getSupabaseAdmin();
  const temporaryPassword = createTemporaryPassword();
  const { data, error } = await supabase
    .from('access_users')
    .update({
      status: 'approved',
      password_hash: hashPassword(temporaryPassword),
      must_change_password: true,
      approved_at: new Date().toISOString(),
      approved_by: approvedBy || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return { user: mapUser(data), temporaryPassword };
}

export async function updateAccessUser(id: string, changes: {
  status?: AccessStatus;
  role?: 'member' | 'admin';
  agency?: AgencyName;
  approvedBy?: string;
}) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};
  if (changes.status) payload.status = changes.status;
  if (changes.role) payload.role = changes.role;
  if (changes.agency) payload.agency = changes.agency;
  if (changes.status === 'approved') {
    payload.approved_at = new Date().toISOString();
    payload.approved_by = changes.approvedBy || null;
  }

  const { data, error } = await supabase
    .from('access_users')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}

export async function touchLastLogin(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('access_users').update({ last_login_at: new Date().toISOString() }).eq('id', id);
}

export async function createResetRequest(email: string) {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const { error } = await supabase.from('password_reset_requests').insert({ email: normalized });
  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function resetUserPassword(id: string) {
  const supabase = getSupabaseAdmin();
  const temporaryPassword = createTemporaryPassword();
  const { data, error } = await supabase
    .from('access_users')
    .update({ password_hash: hashPassword(temporaryPassword), must_change_password: true })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await supabase.from('password_reset_requests').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('email', data.email).eq('status', 'pending');
  return { user: mapUser(data), temporaryPassword };
}


export async function changeUserPassword(id: string, password: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('access_users')
    .update({ password_hash: hashPassword(password), must_change_password: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}


export async function listPasswordResetRequests() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('password_reset_requests')
    .select('id, email, requested_at, status')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}


export async function resetUserCertification(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('access_users')
    .update({
      readiness_checklist: {},
      readiness_completed_at: null,
      guide_completed_at: null,
      certification_status: 'not_started',
      certification_score: null,
      certification_attempts: 0,
      certification_answers: null,
      certified_at: null,
      certification_version: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapUser(data);
}
