import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';
import { AGENCIES } from '@/lib/questionnaire';

export default async function LoginPage() {
  const agency = await getCurrentAgency();

  if (agency) {
    redirect('/questionnaire');
  }

  return (
    <AppShell
      title="Ingresar a la plataforma"
      subtitle="Acceso por agencia. Una vez adentro vas a poder completar el diagnóstico, revisar resultados anteriores y entender el modelo completo con glosario y guía de lectura."
      agency={agency}
    >
      <section className="panel auth-panel">
        <div className="auth-copy">
          <p className="eyebrow">Acceso TEXO</p>
          <h2>Entrá con la credencial de tu agencia</h2>
          <p className="muted">Cada agencia del holding tiene acceso privado. La sesión permite guardar evaluaciones, abrir resultados y construir historial propio.</p>
        </div>

        <form action="/api/admin/login?mode=agency" method="POST" className="auth-form">
          <label className="field">
            <span>Agencia</span>
            <select name="agency" required title="Seleccioná la agencia del holding con la que querés ingresar">
              <option value="">Seleccionar</option>
              {AGENCIES.map((agencyItem) => (
                <option key={agencyItem} value={agencyItem}>
                  {agencyItem}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Password</span>
            <input name="password" type="password" required title="Contraseña asignada a tu agencia" />
          </label>

          <button type="submit" className="button button-primary" title="Iniciar sesión y acceder al cuestionario">
            Entrar
          </button>
        </form>
      </section>
    </AppShell>
  );
}
