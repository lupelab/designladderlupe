export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { NpsActionCreator } from '@/components/NpsActionCreator';
import { getCurrentUser } from '@/lib/auth';
import {
  availableNpsPeriods,
  buildNpsActionCandidates,
  calculateNps,
  computeNpsAgencyRanking,
  computeNpsDriverMetrics,
  extractNpsThemes,
  filterNpsRows,
  getNpsCriticalAccounts,
  getNpsSurveyRows,
  identifyNpsOpportunities,
  normalizeNpsAgency,
  previousNpsPeriod,
  summarizeNpsAspects,
  topNpsStrengths,
} from '@/lib/nps';
import { AgencyName } from '@/lib/types';

function signed(value: number) {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function npsClass(value: number) {
  if (value >= 50) return 'excellent';
  if (value >= 0) return 'neutral';
  return 'critical';
}

export default async function NpsPage({ searchParams }: { searchParams: { period?: string; agency?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const canSeeHolding = user.role === 'admin' || user.agency === 'TEXO';
  let rows = [] as Awaited<ReturnType<typeof getNpsSurveyRows>>;
  let loadingError = '';

  try {
    rows = await getNpsSurveyRows();
  } catch (error) {
    loadingError = error instanceof Error ? error.message : 'No se pudieron leer las respuestas NPS.';
  }

  const periods = availableNpsPeriods(rows);
  const selectedPeriod = searchParams.period && periods.includes(searchParams.period) ? searchParams.period : periods[0] || '';
  const availableAgencies = [...new Set(rows.map((row) => row.agency))].sort();
  const requestedAgency = normalizeNpsAgency(searchParams.agency);
  const selectedAgency: AgencyName | undefined = canSeeHolding
    ? requestedAgency && requestedAgency !== 'TEXO' && availableAgencies.includes(requestedAgency) ? requestedAgency : undefined
    : user.agency;

  const previousPeriod = selectedPeriod ? previousNpsPeriod(selectedPeriod) : null;
  const currentRows = selectedPeriod ? filterNpsRows(rows, selectedPeriod, selectedAgency) : [];
  const previousRows = previousPeriod ? filterNpsRows(rows, previousPeriod, selectedAgency) : [];
  const recommendation = calculateNps(currentRows.map((row) => row.recommendationScore));
  const previousRecommendation = calculateNps(previousRows.map((row) => row.recommendationScore));
  const continuity = calculateNps(currentRows.map((row) => row.continuityScore));
  const drivers = computeNpsDriverMetrics(currentRows, previousRows);
  const strengths = topNpsStrengths(drivers, 3);
  const opportunities = identifyNpsOpportunities(currentRows, previousRows).slice(0, 6);
  const aspects = summarizeNpsAspects(currentRows);
  const themes = extractNpsThemes(currentRows);
  const criticalAccounts = getNpsCriticalAccounts(currentRows);
  const ranking = canSeeHolding && !selectedAgency && selectedPeriod ? computeNpsAgencyRanking(rows, selectedPeriod) : [];
  const actionCandidates = selectedAgency && selectedPeriod
    ? buildNpsActionCandidates({ agency: selectedAgency, period: selectedPeriod, currentRows, previousRows })
    : [];
  const meetingRequests = currentRows.filter((row) => /sí|si|yes/i.test(row.meetingRequested)).length;

  return (
    <AppShell
      title="NPS de clientes"
      agency={user.agency}
      subtitle="Leé la voz del cliente por agencia y convertí las principales brechas en tarjetas accionables dentro del mismo plan de seguimiento."
      actions={<Link href="/action-plan" className="button button-secondary">Abrir plan y seguimiento</Link>}
    >
      {loadingError ? (
        <section className="panel nps-config-panel">
          <span className="nps-config-icon">!</span>
          <div>
            <p className="eyebrow">Configuración pendiente</p>
            <h2>Conectá el Google Sheet del NPS</h2>
            <p>{loadingError}</p>
            <div className="nps-env-list"><code>NPS_GOOGLE_SHEETS_ID</code><code>NPS_GOOGLE_SERVICE_ACCOUNT_EMAIL</code><code>NPS_GOOGLE_PRIVATE_KEY</code><code>NPS_GOOGLE_SHEET_NAME=Respuestas</code></div>
            <small>También se aceptan las variables anteriores sin el prefijo NPS_: GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY y GOOGLE_SHEET_NAME.</small>
          </div>
        </section>
      ) : !selectedPeriod ? (
        <section className="panel empty-panel"><h2>Todavía no hay respuestas NPS</h2><p className="muted">Cuando la hoja Respuestas reciba datos, este módulo los mostrará automáticamente.</p></section>
      ) : (
        <>
          <section className="panel nps-hero-panel">
            <div className="nps-hero-copy">
              <span className="hero-badge">Percepción externa · {selectedAgency || 'Holding TEXO'}</span>
              <h2>{selectedAgency ? `Qué dicen los clientes de ${selectedAgency}` : 'Lectura consolidada de las agencias'}</h2>
              <p>El NPS complementa el diagnóstico interno: muestra si las prácticas de la agencia se traducen en una experiencia valiosa, confiable y recomendable para sus clientes.</p>
              <form className="nps-filters" method="GET">
                <label><span>Período</span><select name="period" defaultValue={selectedPeriod}>{periods.map((period) => <option key={period} value={period}>{period}</option>)}</select></label>
                {canSeeHolding ? <label><span>Agencia</span><select name="agency" defaultValue={selectedAgency || ''}><option value="">Todas las agencias</option>{availableAgencies.map((agency) => <option key={agency} value={agency}>{agency}</option>)}</select></label> : null}
                <button className="button button-primary" type="submit">Actualizar vista</button>
              </form>
            </div>
            <div className={`nps-score-hero ${npsClass(recommendation.nps)}`}>
              <span>NPS recomendación</span>
              <strong>{recommendation.nps}</strong>
              <small>{recommendation.total} respuestas · {selectedPeriod}</small>
            </div>
          </section>

          <section className="nps-metric-grid">
            <article><span>Variación</span><strong>{signed(recommendation.nps - previousRecommendation.nps)}</strong><small>{previousPeriod ? `vs. ${previousPeriod}` : 'Sin período anterior'}</small></article>
            <article><span>NPS continuidad</span><strong>{continuity.nps}</strong><small>Intención de seguir contratando</small></article>
            <article><span>Promotores</span><strong>{recommendation.promotersPct}%</strong><small>{recommendation.promoters} respuestas</small></article>
            <article><span>Detractores</span><strong>{recommendation.detractorsPct}%</strong><small>{recommendation.detractors} respuestas</small></article>
            <article><span>Reuniones solicitadas</span><strong>{meetingRequests}</strong><small>Seguimiento directo pedido</small></article>
          </section>

          <section className="panel nps-distribution-panel">
            <div className="section-head"><div><p className="eyebrow">Distribución</p><h2>Cómo se compone el NPS</h2></div></div>
            <div className="nps-distribution-bar" aria-label="Distribución de promotores, pasivos y detractores">
              <span className="promoters" style={{ width: `${recommendation.promotersPct}%` }}>{recommendation.promotersPct ? `${recommendation.promotersPct}%` : ''}</span>
              <span className="passives" style={{ width: `${recommendation.passivesPct}%` }}>{recommendation.passivesPct ? `${recommendation.passivesPct}%` : ''}</span>
              <span className="detractors" style={{ width: `${recommendation.detractorsPct}%` }}>{recommendation.detractorsPct ? `${recommendation.detractorsPct}%` : ''}</span>
            </div>
            <div className="nps-distribution-legend"><span><i className="promoters" />Promotores · 9–10</span><span><i className="passives" />Pasivos · 7–8</span><span><i className="detractors" />Detractores · 0–6</span></div>
          </section>

          {ranking.length ? (
            <section className="panel nps-ranking-panel">
              <div className="section-head"><div><p className="eyebrow">Holding TEXO</p><h2>Comparación entre agencias</h2><p className="muted">El ranking ayuda a detectar prácticas que pueden compartirse dentro del holding. No reemplaza el análisis cualitativo ni el tamaño de la muestra.</p></div></div>
              <div className="table-wrap"><table><thead><tr><th>#</th><th>Agencia</th><th>NPS</th><th>Continuidad</th><th>Respuestas</th><th></th></tr></thead><tbody>{ranking.map((item, index) => <tr key={item.agency}><td>{index + 1}</td><td><strong>{item.agency}</strong></td><td>{item.nps}</td><td>{item.continuityNps}</td><td>{item.responses}</td><td><Link className="text-link" href={`/nps?period=${encodeURIComponent(selectedPeriod)}&agency=${item.agency}`}>Analizar →</Link></td></tr>)}</tbody></table></div>
            </section>
          ) : null}

          <section className="nps-insight-grid">
            <article className="panel">
              <div className="section-head"><div><p className="eyebrow">Fortalezas</p><h2>Qué conviene sostener</h2></div></div>
              <div className="nps-driver-list">{strengths.map((item) => <div key={item.key} className="nps-driver-row"><div><strong>{item.label}</strong><small>Cobertura {item.coverage}%</small></div><span>{item.average}/5</span><em className={item.trend < 0 ? 'down' : ''}>{signed(item.trend)}</em></div>)}</div>
            </article>
            <article className="panel">
              <div className="section-head"><div><p className="eyebrow">Oportunidades</p><h2>Qué necesita una respuesta</h2></div></div>
              <div className="nps-opportunity-list">{opportunities.map((item) => <article key={item.key}><div><strong>{item.label}</strong><p>{item.summary}</p></div><span className={`priority-badge priority-${item.priority.toLowerCase()}`}>{item.priority}</span></article>)}</div>
            </article>
          </section>

          <section className="nps-insight-grid">
            <article className="panel">
              <div className="section-head"><div><p className="eyebrow">Comentarios</p><h2>Temas que se repiten</h2></div></div>
              <div className="nps-theme-cloud">{themes.length ? themes.map((item) => <span key={item.theme}>{item.theme}<strong>{item.count}</strong></span>) : <p className="muted">Todavía no hay temas repetidos suficientes.</p>}</div>
            </article>
            <article className="panel">
              <div className="section-head"><div><p className="eyebrow">Aspectos elegidos</p><h2>Focos más mencionados</h2></div></div>
              <div className="nps-aspect-list">{aspects.map((item) => <div key={item.aspect}><span>{item.aspect}</span><strong>{item.mentions}</strong></div>)}</div>
            </article>
          </section>

          {criticalAccounts.length ? (
            <section className="panel nps-alerts-panel">
              <div className="section-head"><div><p className="eyebrow">Recuperación y seguimiento</p><h2>Cuentas que requieren atención</h2><p className="muted">Incluye detractores y personas que solicitaron una reunión. Los datos se muestran solo dentro de la agencia correspondiente o para administración TEXO.</p></div></div>
              <div className="table-wrap"><table><thead><tr><th>Organización</th><th>Contacto</th><th>NPS</th><th>Motivo</th><th>Reunión</th></tr></thead><tbody>{criticalAccounts.map((row, index) => <tr key={`${row.email}-${index}`}><td><strong>{row.organization || 'Sin organización'}</strong><small className="table-subcopy">{row.service || 'Servicio no indicado'}</small></td><td>{row.respondentName || row.email || '—'}</td><td><span className={row.recommendationScore <= 6 ? 'nps-score-badge critical' : 'nps-score-badge'}>{row.recommendationScore}</span></td><td>{row.scoreReason || row.additionalComments || 'Sin comentario'}</td><td>{row.meetingRequested || 'No'}</td></tr>)}</tbody></table></div>
            </section>
          ) : null}

          {selectedAgency ? (
            <NpsActionCreator agency={selectedAgency} period={selectedPeriod} candidates={actionCandidates} />
          ) : (
            <section className="panel nps-select-agency-panel"><span>→</span><div><strong>Elegí una agencia para crear acciones</strong><p>La vista consolidada sirve para comparar. Las tarjetas deben asignarse a una agencia específica para que aparezcan en su Plan y seguimiento.</p></div></section>
          )}
        </>
      )}
    </AppShell>
  );
}
