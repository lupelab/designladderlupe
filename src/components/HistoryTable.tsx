import Link from 'next/link';
import { AssessmentRecord } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function HistoryTable({ items }: { items: AssessmentRecord[] }) {
  if (!items.length) {
    return (
      <section className="panel empty-panel">
        <h3>Todavía no hay diagnósticos guardados</h3>
        <p className="muted">Completá la primera evaluación para empezar a construir una línea de base y seguir la evolución de la agencia en el tiempo.</p>
      </section>
    );
  }

  return (
    <section className="panel table-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">Seguimiento</p>
          <h3>Historial de diagnósticos guardados</h3>
          <p className="muted">Cada fila representa una foto del estado de madurez de diseño en un momento determinado. Esto permite comparar evolución, contexto y prioridades.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cuenta / evaluador</th>
              <th>Agencia</th>
              <th>Score</th>
              <th>Peldaño</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.createdAt)}</td>
                <td>
                  <strong>{item.respondentName}</strong>
                  {item.respondentEmail ? <small className="table-subcopy">{item.respondentEmail}</small> : null}
                </td>
                <td>{item.agency}</td>
                <td>{item.overallScore.toFixed(2)}</td>
                <td>{item.maturityLevel}</td>
                <td>
                  <Link href={`/results/${item.id}`} className="button button-secondary button-small" title="Abrir el resultado completo de esta evaluación">
                    Ver resultado
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
