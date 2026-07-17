import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResultsView } from '@/components/ResultsView';
import {
  getAssessmentById,
  getTexoBenchmark,
  listAssessments,
} from '@/lib/apps-script';
import {
  TEXO_HOLDING_BENCHMARK,
  averageDimensionScores,
  averageOverallScore,
} from '@/lib/benchmark';
import { getCurrentAgency } from '@/lib/auth';

export default async function ResultsPage({
  params,
}: {
  params: { id: string };
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

  let holdingBenchmark = TEXO_HOLDING_BENCHMARK;

  try {
    const texoBenchmark = await getTexoBenchmark();

    if (texoBenchmark) {
      holdingBenchmark = texoBenchmark;
    }
  } catch (error) {
    console.error('No se pudo cargar benchmark TEXO dinámico:', error);
  }

  return (
    <AppShell
      title="Resultados del diagnóstico"
      agency={agency}
      subtitle="Leé el estadio actual de tu agencia, comparalo con la referencia TEXO y usá las recomendaciones como hoja de ruta para la mejora continua."
      actions={
        <div className="inline-actions">
          <Link
            href="/history"
            className="button button-secondary"
            title="Volver al historial de evaluaciones guardadas"
          >
            Volver al historial
          </Link>
        </div>
      }
    >
      <ResultsView
        item={item}
        holdingBenchmark={holdingBenchmark}
        agencyAverage={agencyAverage}
      />
    </AppShell>
  );
}