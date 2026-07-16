import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

type JsonRecord = Record<string, unknown>;

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'AI diagnosis route activa',
    method: 'Usá POST para generar diagnóstico modular con Claude',
  });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing ANTHROPIC_API_KEY' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const assessment = body.assessment;
    const texoBenchmark = body.texoBenchmark;

    if (!assessment) {
      return NextResponse.json(
        { ok: false, error: 'Missing assessment' },
        { status: 400 }
      );
    }

    const prompt = `
Sos un consultor senior de innovación, cultura organizacional y diseño centrado en las personas para TEXO.

Analizá la evaluación recibida y generá un diagnóstico ejecutivo modular para una interfaz visual.

Reglas:
- No inventes información.
- Usá únicamente los datos recibidos.
- Máximo 400 palabras en total.
- Priorizá estrategia corporativa y próximos pasos concretos.
- Evitá informes largos.
- Siempre que menciones diseño, hablá de diseño centrado en las personas.
- Diseño centrado en las personas significa entender necesidades reales de clientes, usuarios, audiencias y equipos internos para crear, probar y mejorar soluciones.
- Las recomendaciones deben ser accionables, tipo checklist.
- Cada prioridad debe poder convertirse en una acción con responsable, fecha, evidencia y seguimiento.
- La lectura debe orientar cómo avanzar al siguiente peldaño del modelo.
- Para la próxima evaluación, explicá la consistencia con esta regla: A veces si fue puntual, En desarrollo si hay responsable/piloto, Frecuente si se repitió con evidencia, Siempre si quedó instalado como práctica estable.

DATOS DE LA AGENCIA:
${JSON.stringify(assessment, null, 2)}

BENCHMARK TEXO:
${JSON.stringify(texoBenchmark || null, null, 2)}

El modelo evalúa:
- Liderazgo visionario
- Liderazgo inspiracional
- Liderazgo relacional
- Diseño centrado en las personas como identidad
- Adopción del diseño centrado en las personas
- Innovación por diseño centrado en las personas
`;

    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1600,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
        tools: [
          {
            name: 'generate_diagnosis',
            description:
              'Genera un diagnóstico ejecutivo modular para una evaluación de cultura de innovación y diseño centrado en las personas.',
            input_schema: {
              type: 'object',
              properties: {
                executiveSummary: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    summary: { type: 'string' },
                    status: { type: 'string' },
                    nextStep: { type: 'string' },
                  },
                  required: ['title', 'summary', 'status', 'nextStep'],
                },
                keyInsights: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      type: {
                        type: 'string',
                        enum: ['strength', 'gap', 'opportunity', 'risk'],
                      },
                    },
                    required: ['title', 'description', 'type'],
                  },
                },
                benchmarkComparison: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      dimension: { type: 'string' },
                      agencyScore: { type: 'number' },
                      texoScore: { type: 'number' },
                      gap: { type: 'number' },
                      status: {
                        type: 'string',
                        enum: ['above', 'below', 'equal'],
                      },
                    },
                    required: [
                      'dimension',
                      'agencyScore',
                      'texoScore',
                      'gap',
                      'status',
                    ],
                  },
                },
                priorities: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      priority: {
                        type: 'string',
                        enum: ['Alta', 'Media', 'Baja'],
                      },
                      impact: {
                        type: 'string',
                        enum: ['Alto', 'Medio', 'Bajo'],
                      },
                      effort: {
                        type: 'string',
                        enum: ['Alto', 'Medio', 'Bajo'],
                      },
                      checklist: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: [
                      'title',
                      'priority',
                      'impact',
                      'effort',
                      'checklist',
                    ],
                  },
                },
                roadmap90Days: {
                  type: 'object',
                  properties: {
                    days30: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    days60: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    days90: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['days30', 'days60', 'days90'],
                },
                finalRecommendation: { type: 'string' },
              },
              required: [
                'executiveSummary',
                'keyInsights',
                'benchmarkComparison',
                'priorities',
                'roadmap90Days',
                'finalRecommendation',
              ],
            },
          },
        ],
        tool_choice: {
          type: 'tool',
          name: 'generate_diagnosis',
        },
      }),
    });

    const data = await claudeResponse.json();

    if (!claudeResponse.ok) {
      return NextResponse.json(
        { ok: false, error: 'Claude API error', details: data },
        { status: claudeResponse.status }
      );
    }

    const toolUse = Array.isArray(data.content)
      ? data.content.find(
          (item: any) =>
            item.type === 'tool_use' && item.name === 'generate_diagnosis'
        )
      : null;

    if (!toolUse || !toolUse.input) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Claude no devolvió diagnóstico estructurado.',
          details: data,
        },
        { status: 500 }
      );
    }

    const diagnosis = toolUse.input as JsonRecord;

    return NextResponse.json({
      ok: true,
      diagnosis,
      usedFallback: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}