'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AGENCIES } from '@/lib/questionnaire';

type Mode = 'login' | 'register' | 'forgot';

export function LoginExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode');
  const [mode, setMode] = useState<Mode>(initialMode === 'register' || initialMode === 'forgot' ? initialMode : 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function changeMode(next: Mode) {
    setMode(next);
    setError('');
    setSuccess('');
  }

  async function submitJson(event: FormEvent<HTMLFormElement>, endpoint: string) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());


    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo completar la operación.');

      if (mode === 'login') {
        router.push(data.redirectTo || '/dashboard');
        router.refresh();
      } else {
        setSuccess(data.message || 'Solicitud registrada correctamente.');
        if (mode === 'register') setMode('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-story">
        <div className="auth-brand"><span>T</span><strong>Design Ladder <small>by TEXO</small></strong></div>
        <div className="auth-story-copy">
          <span className="auth-kicker">Cultura de innovación medible</span>
          <h1>Transformá prácticas dispersas en un sistema de evolución.</h1>
          <p>Diagnóstico, lectura ejecutiva y plan de acción en un recorrido simple, seguro y trazable.</p>
          <div className="auth-proof-grid">
            <article><strong>6</strong><span>dimensiones estratégicas</span></article>
            <article><strong>22</strong><span>prácticas observables</span></article>
            <article><strong>90</strong><span>días para implementar</span></article>
          </div>
        </div>
        <div className="auth-story-footer"><span>Un producto interno TEXO</span><span>Diseño centrado en las personas</span></div>
      </section>

      <section className="auth-entry">
        <div className="auth-card">
          <div className="auth-card-head">
            <span className="auth-mobile-brand">Design Ladder · TEXO</span>
            <h2>{mode === 'login' ? 'Bienvenido de nuevo' : mode === 'register' ? 'Solicitar acceso' : 'Recuperar contraseña'}</h2>
            <p>{mode === 'login' ? 'Ingresá con tu cuenta aprobada.' : mode === 'register' ? 'Completá tus datos sin crear una contraseña. Cuando el administrador te apruebe, recibirás una clave temporal.' : 'Registraremos el pedido para que un administrador restablezca tu acceso.'}</p>
          </div>

          {mode === 'login' ? (
            <form className="auth-modern-form" onSubmit={(event) => submitJson(event, '/api/auth/login')}>
              <label><span>Email corporativo</span><input name="email" type="email" placeholder="nombre@empresa.com" autoComplete="email" required /></label>
              <label><span>Contraseña</span><div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Ocultar' : 'Ver'}</button></div></label>
              <div className="auth-form-row"><label className="remember-row"><input type="checkbox" name="remember" /> <span>Mantener sesión</span></label><button type="button" className="auth-text-button" onClick={() => changeMode('forgot')}>Olvidé mi contraseña</button></div>
              {error ? <div className="auth-message auth-message-error" role="alert">{error}</div> : null}
              {success ? <div className="auth-message auth-message-success">{success}</div> : null}
              <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Validando acceso…' : 'Ingresar'}</button>
              <div className="auth-access-request"><strong>¿Aún no tenés contraseña?</strong><p>Solicitá tu acceso. No necesitás crear una clave ahora.</p><button type="button" className="button button-secondary" onClick={() => changeMode('register')}>Solicitar acceso sin contraseña</button></div>
            </form>
          ) : null}

          {mode === 'register' ? (
            <form className="auth-modern-form" onSubmit={(event) => submitJson(event, '/api/auth/register')}>
              <div className="auth-two-columns">
                <label><span>Nombre completo</span><input name="fullName" placeholder="Nombre y apellido" required /></label>
                <label><span>Agencia</span><select name="agency" required><option value="">Seleccionar</option>{AGENCIES.map((agency) => <option key={agency}>{agency}</option>)}</select></label>
              </div>
              <label><span>Email corporativo</span><input name="email" type="email" placeholder="nombre@empresa.com" required /></label>
              <label><span>Cargo o función</span><input name="jobTitle" placeholder="Ej. Dirección, estrategia, cuentas" /></label>
              <div className="auth-passwordless-note">
                <span>1</span>
                <div><strong>No necesitás contraseña todavía</strong><p>El administrador validará tu solicitud y, al aprobarla, generará una clave temporal que deberás cambiar en el primer ingreso.</p></div>
              </div>
              <label className="remember-row consent-row"><input type="checkbox" required /> <span>Confirmo que los datos son correctos y solicito acceso a la plataforma.</span></label>
              {error ? <div className="auth-message auth-message-error" role="alert">{error}</div> : null}
              <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Enviando solicitud…' : 'Solicitar acceso'}</button>
              <p className="auth-switch">¿Ya tenés cuenta? <button type="button" onClick={() => changeMode('login')}>Volver al ingreso</button></p>
            </form>
          ) : null}

          {mode === 'forgot' ? (
            <form className="auth-modern-form" onSubmit={(event) => submitJson(event, '/api/auth/forgot-password')}>
              <label><span>Email de tu cuenta</span><input name="email" type="email" placeholder="nombre@empresa.com" required /></label>
              {error ? <div className="auth-message auth-message-error" role="alert">{error}</div> : null}
              {success ? <div className="auth-message auth-message-success">{success}</div> : null}
              <button className="button button-primary auth-submit" disabled={loading}>{loading ? 'Registrando solicitud…' : 'Solicitar recuperación'}</button>
              <p className="auth-switch"><button type="button" onClick={() => changeMode('login')}>← Volver al ingreso</button></p>
            </form>
          ) : null}

          <details className="bootstrap-access">
            <summary>Acceso administrativo inicial</summary>
            <form action="/api/admin/login?mode=admin" method="POST">
              <input name="token" type="password" placeholder="Token administrador" required />
              <button className="button button-secondary button-small">Entrar al panel</button>
            </form>
          </details>
        </div>
      </section>
    </main>
  );
}
