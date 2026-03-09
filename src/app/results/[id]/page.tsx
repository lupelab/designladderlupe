import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResultsView } from '@/components/ResultsView';
import { getAssessmentById, listAssessments } from '@/lib/apps-script';
import { getCurrentAgency } from '@/lib/auth';
import { TEXO_HOLDING_BENCHMARK, averageDimensionScores, averageOverallScore } from '@/lib/benchmark';

export default async function ResultsPage({
  params,
}: {
  params: { id: string }
}) {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/login');
  }

  const item = await getAssessmentById(params.id);

  if (!item || item.agency !== agency) {
    notFound();
  }

  const agencyHistory = await listAssessments(agency);
  const agencyAverage = agencyHistory.items.length
    ? {
        overallScore: averageOverallScore(agencyHistory.items),
        dimensionScores: averageDimensionScores(agencyHistory.items),
      }
    : undefined;

  return (
    <AppShell
      title="Resultados del diagnóstico"
      agency={agency}
      subtitle="Leé el estadio actual de tu agencia, comparalo con la referencia TEXO y usá las recomendaciones como hoja de ruta para la mejora continua."
      actions={
        <div className="inline-actions">
          <Link href="/history" className="button button-secondary" title="Volver al historial de evaluaciones guardadas">
            Volver al historial
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="button button-secondary" title="Cerrar la sesión actual de la agencia">
              Salir
            </button>
          </form>
        </div>
      }
    >
      <ResultsView item={item} holdingBenchmark={TEXO_HOLDING_BENCHMARK} agencyAverage={agencyAverage} />
    </AppShell>
  );
}
