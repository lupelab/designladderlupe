import { NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'AI diagnosis route activa',
    method: 'Usá POST para generar diagnóstico con Claude',
  });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing ANTHROPIC_API_KEY',
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const assessment = body.assessment;
    const texoBenchmark = body.texoBenchmark;

    if (!assessment) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing assessment',
        },
        { status: 400 }
      );
    }

    const prompt = `
Sos un consultor senior de innovación, cultura organizacional y diseño estratégico para TEXO.

Tu tarea es generar un diagnóstico ejecutivo para una agencia a partir de su evaluación de Cultura de Innovación Design-Led.

No inventes información.
Usá únicamente los datos recibidos.
Si falta información, indicalo de forma ejecutiva.

DATOS DE LA AGENCIA:
${JSON.stringify(assessment, null, 2)}

BENCHMARK TEXO:
${JSON.stringify(texoBenchmark || null, null, 2)}

El modelo evalúa 6 bloques:
1. Liderazgo visionario
2. Liderazgo inspiracional
3. Liderazgo relacional
4. Diseño como identidad
5. Adopción del diseño
6. Innovación por diseño

Generá una respuesta en español, con tono ejecutivo, claro y accionable.

MUY IMPORTANTE:
No uses Markdown.
No uses símbolos como #, ##, ###, **, *, ---, guiones largos decorativos ni formato de lista Markdown.
No uses numeración tipo "1.", "2.", "3.".
No uses negritas.
No uses títulos con almohadillas.
No devuelvas HTML.
Usá texto plano simple.
Separá cada sección con una línea en blanco.
Cada título debe ir en texto simple, por ejemplo: "Diagnóstico general".

Estructura requerida:

Diagnóstico general

Lectura de madurez

Fortalezas principales

Brechas críticas

Comparación contra TEXO

Recomendaciones prioritarias

Próximos 90 días

La respuesta debe ser específica para la agencia evaluada.
No uses frases genéricas.
No repitas todos los datos numéricos, interpretalos.
No menciones que sos una IA.
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
        max_tokens: 1800,
        temperature: 0.35,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await claudeResponse.json();

    if (!claudeResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Claude API error',
          details: data,
        },
        { status: claudeResponse.status }
      );
    }

    const rawDiagnosis =
      Array.isArray(data.content) && data.content[0]?.type === 'text'
        ? data.content[0].text
        : '';

    const diagnosis = cleanMarkdownArtifacts(rawDiagnosis);

    return NextResponse.json({
      ok: true,
      diagnosis,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}

function cleanMarkdownArtifacts(text: string) {
  return String(text || '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^---+$/gm, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}