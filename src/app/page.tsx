import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { getCurrentAgency } from '@/lib/auth';

const FLOW_STEPS = [
  {
    number: '1',
    title: 'Leer',
    text: 'Descargar el libro base en PDF para alinear el marco de cultura de innovación y diseño centrado en las personas.',
    href: '/master-plan-innovacion-texo.pdf',
    label: 'Descargar PDF',
  },
  {
    number: '2',
    title: 'Aprender',
    text: 'Revisar el instructivo. La recomendación es que una sola persona complete el cuestionario en representación de la agencia.',
    href: '/about-model',
    label: 'Ver instructivo',
  },
  {
    number: '3',
    title: 'Alinear lenguaje',
    text: 'Abrir el glosario para reducir interpretaciones distintas sobre diseño, innovación, prototipo, rituales y evidencia.',
    href: '/glossary',
    label: 'Ver glosario',
  },
  {
    number: '4',
    title: 'Responder',
    text: 'Completar el cuestionario de forma simple, sin tecnicismos, pensando en prácticas reales de la agencia.',
    href: '/questionnaire',
    label: 'Ir al cuestionario',
  },
  {
    number: '5',
    title: 'Implementar',
    text: 'Usar conclusiones, checklist y próximos pasos para avanzar de peldaño en la escalera de madurez.',
    href: '/history',
    label: 'Ver historial',
  },
];

export default async function HomePage() {
  const agency = await getCurrentAgency();

  return (
    <AppShell
      title="Cultura de innovación y diseño centrado en las personas"
      subtitle="Instrumento TEXO para leer, aprender e implementar mejoras concretas en la forma en que cada agencia innova, decide y trabaja desde las personas."
      agency={agency}
      actions={
        agency ? (
          <Link href="/questionnaire" className="button button-primary" title="Continuar al cuestionario">
            Continuar
          </Link>
        ) : (
          <Link href="/login" className="button button-primary" title="Ingresar con la credencial de tu empresa">
            Ingresar
          </Link>
        )
      }
    >
      <section className="hero-home panel home-grid texo-intro-panel">
        <div>
          <p className="eyebrow">Flujo recomendado</p>
          <h2>Leer, aprender e implementar antes de diagnosticar</h2>
          <p className="lead">
            Para reducir carga cognitiva y subjetividad, el recorrido está ordenado en cinco pasos. El cuestionario debe ser completado por una sola persona en representación de la agencia o empresa, idealmente con una mirada transversal del equipo.
          </p>
          <div className="inline-actions hero-actions">
            <Link href="/master-plan-innovacion-texo.pdf" className="button button-primary" target="_blank">
              Descargar libro PDF
            </Link>
            <Link href={agency ? '/questionnaire' : '/login'} className="button button-secondary">
              Empezar recorrido
            </Link>
          </div>
        </div>

        <div className="feature-list">
          <article className="mini-card">
            <strong>Diseño centrado en las personas</strong>
            <p>No se refiere solo a estética. Es una forma de entender necesidades reales de clientes, usuarios, audiencias y equipos internos para crear mejores soluciones.</p>
          </article>
          <article className="mini-card">
            <strong>Estrategia corporativa</strong>
            <p>Las recomendaciones priorizan acciones alineadas al crecimiento, la cultura y la mejora sistemática del holding.</p>
          </article>
          <article className="mini-card">
            <strong>Menos texto, más acción</strong>
            <p>Los resultados se muestran por módulos, con checklist y secciones desplegables para profundizar solo cuando haga falta.</p>
          </article>
          <article className="mini-card">
            <strong>Benchmark TEXO</strong>
            <p>La comparación se calcula contra el promedio de la última evaluación disponible de cada agencia o empresa.</p>
          </article>
        </div>
      </section>

      <section className="panel flow-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Secuencia lógica</p>
            <h3>5 pasos para usar el instrumento</h3>
          </div>
        </div>
        <div className="flow-grid">
          {FLOW_STEPS.map((step) => (
            <article className="flow-card" key={step.number}>
              <span>{step.number}</span>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
              <Link href={step.href} className="button button-secondary button-small" target={step.href.endsWith('.pdf') ? '_blank' : undefined}>
                {step.label}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
