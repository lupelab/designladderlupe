'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('confirmation') || '');
    if (password !== confirmation) return setError('Las contraseñas no coinciden.');
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo cambiar la contraseña.');
      router.push(data.redirectTo || '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
      setLoading(false);
    }
  }

  return (
    <form className="auth-modern-form" onSubmit={submit}>
      <label><span>Nueva contraseña</span><input type="password" name="password" minLength={8} placeholder="Mínimo 8 caracteres" required /></label>
      <label><span>Confirmar contraseña</span><input type="password" name="confirmation" minLength={8} placeholder="Repetir contraseña" required /></label>
      {error ? <div className="auth-message auth-message-error">{error}</div> : null}
      <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Actualizando…' : 'Guardar nueva contraseña'}</button>
    </form>
  );
}
