'use client';

import { useEffect, useMemo, useState } from 'react';
import { AGENCIES } from '@/lib/questionnaire';
import { AccessUser } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', suspended: 'Suspendido',
};

export function AdminAccessPanel() {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [resetRequests, setResetRequests] = useState<Array<{ id: string; email: string; requested_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState<{ name: string; password: string } | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/access', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudieron cargar los accesos.');
      setUsers(data.users || []);
      setResetRequests(data.resetRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los accesos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  const counts = useMemo(() => ({
    pending: users.filter((user) => user.status === 'pending').length,
    approved: users.filter((user) => user.status === 'approved').length,
    suspended: users.filter((user) => user.status === 'suspended').length,
    certified: users.filter((user) => user.certificationStatus === 'passed').length,
    all: users.length,
  }), [users]);

  const visible = users.filter((user) => {
    const statusMatch = filter === 'all' || user.status === filter;
    const query = search.trim().toLowerCase();
    const searchMatch = !query || [user.fullName, user.email, user.agency, user.jobTitle].some((value) => String(value || '').toLowerCase().includes(query));
    return statusMatch && searchMatch;
  });

  async function updateUser(id: string, payload: Record<string, unknown>) {
    setWorkingId(id);
    setError('');
    try {
      const response = await fetch('/api/admin/access', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo actualizar el acceso.');
      if (data.temporaryPassword) {
        setTemporaryPassword({ name: data.user.fullName, password: data.temporaryPassword });
      }
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el acceso.');
    } finally {
      setWorkingId('');
    }
  }

  return (
    <>
      <section className="admin-kpis">
        <article><span>Pendientes</span><strong>{counts.pending}</strong><small>Requieren una decisión</small></article>
        <article><span>Activos</span><strong>{counts.approved}</strong><small>Con acceso aprobado</small></article>
        <article><span>Certificados</span><strong>{counts.certified}</strong><small>Habilitados para medir</small></article>
        <article><span>Total</span><strong>{counts.all}</strong><small>Cuentas registradas</small></article>
      </section>

      {resetRequests.length ? (
        <section className="panel reset-request-panel">
          <div><p className="eyebrow">Recuperación de cuenta</p><h2>{resetRequests.length} {resetRequests.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}</h2><p className="muted">Generá una contraseña temporal y compartila por un canal interno seguro.</p></div>
          <div className="reset-request-list">
            {resetRequests.map((request) => {
              const matchedUser = users.find((user) => user.email.toLowerCase() === request.email.toLowerCase());
              return <article key={request.id}><div><strong>{matchedUser?.fullName || request.email}</strong><span>{request.email} · {new Date(request.requested_at).toLocaleDateString('es-PY')}</span></div>{matchedUser ? <button className="button button-primary button-small" disabled={workingId === matchedUser.id} onClick={() => updateUser(matchedUser.id, { action: 'reset-password' })}>Crear clave temporal</button> : <span className="access-status access-status-rejected">Cuenta no encontrada</span>}</article>;
            })}
          </div>
        </section>
      ) : null}

      <section className="panel admin-access-panel">
        <div className="admin-toolbar">
          <div><p className="eyebrow">Gobierno de accesos</p><h2>Solicitudes y usuarios</h2><p className="muted">Aprobá solo perfiles identificados. Al aprobar una solicitud, el sistema genera una contraseña temporal que se muestra una sola vez.</p></div>
          <div className="admin-toolbar-controls">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar persona, email o agencia" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="pending">Pendientes</option><option value="approved">Aprobados</option><option value="suspended">Suspendidos</option><option value="rejected">Rechazados</option><option value="all">Todos</option>
            </select>
          </div>
        </div>

        {error ? <div className="auth-message auth-message-error">{error}</div> : null}
        {loading ? <div className="admin-empty"><span className="mini-spinner" /> Cargando accesos…</div> : null}
        {!loading && !visible.length ? <div className="admin-empty"><strong>No hay usuarios en esta vista</strong><p>Probá cambiar el filtro o la búsqueda.</p></div> : null}

        <div className="access-user-list">
          {visible.map((user) => (
            <article className="access-user-card" key={user.id}>
              <div className="access-user-avatar">{user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>
              <div className="access-user-main">
                <div className="access-user-title"><div><strong>{user.fullName}</strong><span>{user.email}</span></div><span className={`access-status access-status-${user.status}`}>{STATUS_LABELS[user.status]}</span></div>
                <div className="access-user-meta"><span>{user.agency}</span><span>{user.jobTitle || 'Sin cargo declarado'}</span><span>Solicitado {new Date(user.requestedAt).toLocaleDateString('es-PY')}</span></div><div className="access-learning-status"><span className={user.readinessCompletedAt ? 'done' : ''}>{user.readinessCompletedAt ? '✓' : '1'} Checklist</span><span className={user.guideCompletedAt ? 'done' : ''}>{user.guideCompletedAt ? '✓' : '2'} Simulacro</span><span className={user.certificationStatus === 'passed' ? 'done' : user.certificationStatus === 'failed' ? 'failed' : ''}>{user.certificationStatus === 'passed' ? `✓ Certificado ${user.certificationScore ?? ''}%` : user.certificationStatus === 'failed' ? `! Examen ${user.certificationScore ?? ''}%` : '3 Certificación'}</span></div>
                <div className="access-user-settings">
                  <label><span>Agencia</span><select value={user.agency} onChange={(event) => updateUser(user.id, { agency: event.target.value })}>{AGENCIES.map((agency) => <option key={agency}>{agency}</option>)}</select></label>
                  <label><span>Permiso</span><select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value })}><option value="member">Miembro</option><option value="admin">Administrador</option></select></label>
                </div>
              </div>
              <div className="access-user-actions">
                {user.status === 'pending' ? <><button className="button button-primary button-small" disabled={workingId === user.id} onClick={() => updateUser(user.id, { action: 'approve' })}>Aprobar y generar clave</button><button className="button button-ghost button-small" disabled={workingId === user.id} onClick={() => updateUser(user.id, { action: 'reject' })}>Rechazar</button></> : null}
                {user.status === 'approved' ? <button className="button button-secondary button-small" disabled={workingId === user.id} onClick={() => updateUser(user.id, { action: 'suspend' })}>Suspender</button> : null}
                {user.status === 'suspended' || user.status === 'rejected' ? <button className="button button-primary button-small" disabled={workingId === user.id} onClick={() => updateUser(user.id, { action: 'reactivate' })}>Reactivar</button> : null}
                <button className="button button-ghost button-small" disabled={workingId === user.id} onClick={() => updateUser(user.id, { action: 'reset-password' })}>Restablecer clave</button>
                {(user.readinessCompletedAt || user.certificationAttempts) ? <button className="button button-ghost button-small" disabled={workingId === user.id} onClick={() => window.confirm('¿Reiniciar checklist, guía y certificación de este usuario?') && updateUser(user.id, { action: 'reset-certification' })}>Reiniciar habilitación</button> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {temporaryPassword ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setTemporaryPassword(null)}>
          <div className="temporary-password-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="hero-badge">Contraseña temporal</span>
            <h3>Clave temporal para {temporaryPassword.name}</h3>
            <p>La cuenta ya puede ingresar. Copiá esta contraseña ahora: por seguridad no volverá a mostrarse y la persona deberá cambiarla en su primer acceso.</p>
            <code>{temporaryPassword.password}</code>
            <button className="button button-primary" onClick={() => navigator.clipboard.writeText(temporaryPassword.password)}>Copiar contraseña</button>
            <button className="button button-ghost" onClick={() => setTemporaryPassword(null)}>Cerrar</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
