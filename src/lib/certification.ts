import { DimensionKey } from '@/lib/types';

export type CertificationQuestion = {
  id: string;
  dimension: DimensionKey;
  principle: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  rationale: string;
};

export const CERTIFICATION_VERSION = 'design-led-culture-v2-30q';
export const CERTIFICATION_PASS_SCORE = 80;
export const CERTIFICATION_QUESTION_COUNT = 30;
export const CERTIFICATION_MIN_CORRECT = 24;

const q = (
  id: string,
  dimension: DimensionKey,
  principle: number,
  prompt: string,
  options: string[],
  correctIndex: number,
  rationale: string
): CertificationQuestion => ({ id, dimension, principle, prompt, options, correctIndex, rationale });

export const CERTIFICATION_QUESTIONS: CertificationQuestion[] = [
  // 1. Liderazgo visionario
  q('cert_vision_01', 'visionary', 1,
    '¿Qué distingue a una visión realmente centrada en usuarios?',
    ['Se limita a metas comerciales internas.', 'Explica para quién se crea valor y orienta decisiones más allá de los KPIs.', 'Solo es conocida por el equipo de diseño.', 'Permanece fija aunque cambien las necesidades de los usuarios.'],
    1,
    'Una visión centrada en usuarios funciona como un norte compartido y conecta el propósito con decisiones cotidianas.'),
  q('cert_vision_02', 'visionary', 1,
    'Una agencia declara que “quiere ser la más premiada del mercado”. ¿Qué falta para que esa visión sea centrada en usuarios?',
    ['Definir qué experiencia o valor busca generar para clientes, audiencias y equipos.', 'Agregar más indicadores financieros.', 'Crear un nuevo logotipo.', 'Reducir la visión a una frase más corta.'],
    0,
    'El reconocimiento puede ser una consecuencia, pero la visión debe aclarar qué valor se pretende crear para las personas.'),
  q('cert_vision_03', 'visionary', 2,
    '¿Cuál es la mejor evidencia de que los líderes patrocinan el diseño?',
    ['Mencionan la innovación en una reunión anual.', 'Asignan tiempo, recursos y participación directa a proyectos centrados en usuarios.', 'Delegan toda la responsabilidad al equipo creativo.', 'Comparten artículos sobre tendencias.'],
    1,
    'El patrocinio se demuestra mediante decisiones, recursos y participación, no solamente mediante discursos.'),
  q('cert_vision_04', 'visionary', 2,
    'Un director es escéptico respecto del diseño. ¿Cuál es la intervención más efectiva?',
    ['Excluirlo del proyecto para evitar fricción.', 'Mostrarle una presentación teórica extensa.', 'Involucrarlo temprano en un proyecto pequeño con resultados observables.', 'Esperar a que cambie de opinión por su cuenta.'],
    2,
    'La experiencia directa y los resultados tangibles suelen generar mayor adhesión que una explicación abstracta.'),
  q('cert_vision_05', 'visionary', 3,
    '¿Qué comportamiento demuestra agilidad estratégica?',
    ['Mantener el plan original para no parecer inconsistente.', 'Revisar hipótesis y ajustar el rumbo cuando cambia la evidencia de usuarios.', 'Cambiar de dirección ante cada opinión aislada.', 'Eliminar toda planificación de largo plazo.'],
    1,
    'La agilidad implica ajustar con evidencia, no improvisar ni renunciar a una dirección estratégica.'),
  q('cert_vision_06', 'visionary', 3,
    'Una estrategia fue aprobada hace un año, pero las necesidades del cliente cambiaron. ¿Qué debería hacer un equipo design-led?',
    ['Continuar sin cambios porque ya existe aprobación.', 'Reformular el problema, validar las nuevas necesidades y proponer un ajuste fundamentado.', 'Cambiar toda la estrategia sin consultar a nadie.', 'Esperar al próximo ciclo presupuestario.'],
    1,
    'La estrategia debe poder evolucionar cuando la evidencia indica que el problema o el contexto cambió.'),
  q('cert_vision_07', 'visionary', 1,
    '¿Cuál de estas prácticas ayuda a mantener viva una visión centrada en usuarios?',
    ['Usarla solamente en presentaciones institucionales.', 'Conectarla con onboarding, decisiones, rituales y revisión de prioridades.', 'Asignarla exclusivamente a Recursos Humanos.', 'Medirla únicamente por cantidad de piezas entregadas.'],
    1,
    'La visión se vuelve cultura cuando aparece de forma consistente en decisiones y procesos, no solo en la comunicación.'),

  // 2. Liderazgo inspirador
  q('cert_inspiration_01', 'inspirational', 4,
    '¿Qué significa que un líder “modele” el diseño?',
    ['Que sepa utilizar software de diseño.', 'Que aplique escucha, empatía, experimentación y foco en usuarios en su propia conducta.', 'Que apruebe todas las ideas del equipo.', 'Que participe solamente al final del proyecto.'],
    1,
    'Modelar diseño significa hacer visibles los comportamientos esperados mediante las propias acciones.'),
  q('cert_inspiration_02', 'inspirational', 5,
    '¿Cuál es la forma más sólida de comprender la experiencia de un usuario?',
    ['Leer únicamente un reporte de terceros.', 'Interactuar directamente, observar el contexto y complementar con datos.', 'Preguntar solo al equipo comercial.', 'Usar la experiencia personal del líder como referencia.'],
    1,
    'La conexión directa permite comprender necesidades, tensiones y comportamientos que un reporte puede no revelar.'),
  q('cert_inspiration_03', 'inspirational', 5,
    'Un gerente decide acompañar una entrevista con clientes. ¿Qué debería hacer para aportar valor?',
    ['Defender la solución actual.', 'Escuchar, observar y evitar conducir al usuario hacia respuestas deseadas.', 'Explicar todas las limitaciones internas.', 'Interrumpir para corregir interpretaciones.'],
    1,
    'La investigación directa requiere curiosidad y escucha, no validación defensiva de una solución existente.'),
  q('cert_inspiration_04', 'inspirational', 6,
    '¿Qué significa crear un entorno seguro para fallar?',
    ['Aceptar cualquier error sin límites.', 'Definir objetivos y límites claros, aprender de errores nuevos y evitar la búsqueda de culpables.', 'Eliminar toda responsabilidad individual.', 'Ocultar fallas para proteger al equipo.'],
    1,
    'La seguridad para experimentar convive con responsabilidad, aprendizaje y límites explícitos.'),
  q('cert_inspiration_05', 'inspirational', 6,
    'Un prototipo falla durante una prueba. ¿Cuál es la mejor respuesta del líder?',
    ['Buscar quién cometió el error.', 'Cancelar toda experimentación futura.', 'Analizar causas, documentar aprendizajes y decidir la siguiente iteración.', 'Presentar el resultado como éxito.'],
    2,
    'El valor de un prototipo fallido está en el aprendizaje que permite mejorar la siguiente decisión.'),
  q('cert_inspiration_06', 'inspirational', 7,
    '¿Por qué es importante reconocer historias de diseño en acción?',
    ['Porque reemplazan la necesidad de medir resultados.', 'Porque vuelven concretos los comportamientos deseados y refuerzan lo que la organización valora.', 'Porque solo motivan a diseñadores.', 'Porque evitan cualquier crítica.'],
    1,
    'Las historias ayudan a que las personas identifiquen comportamientos que pueden repetir en su propio trabajo.'),
  q('cert_inspiration_07', 'inspirational', 7,
    '¿Qué debería celebrarse en una cultura que quiere estimular innovación?',
    ['Únicamente proyectos exitosos y rentables.', 'También intentos bien planteados, aprendizajes y mejoras, aunque el primer resultado no sea perfecto.', 'Solo ideas presentadas por líderes.', 'La cantidad de horas invertidas.'],
    1,
    'Reconocer experimentación y aprendizaje evita que la cultura premie solamente resultados finales.'),

  // 3. Liderazgo relacional
  q('cert_relational_01', 'relational', 8,
    '¿Qué condición favorece que las personas sean honestas con sus líderes?',
    ['Que el líder tenga siempre la última palabra.', 'Que exista seguridad psicológica y no haya represalias por plantear problemas con respeto.', 'Que el feedback sea anónimo en todos los casos.', 'Que solo se hablen temas positivos.'],
    1,
    'La honestidad requiere confianza, apertura y respuestas que no castiguen a quien comparte una realidad incómoda.'),
  q('cert_relational_02', 'relational', 8,
    'Un colaborador admite un error frente a su gerente. ¿Qué respuesta fortalece la seguridad psicológica?',
    ['“¿Quién más fue responsable?”', '“No vuelvas a mencionarlo.”', '“Entendamos qué pasó, qué aprendimos y cómo prevenimos que se repita.”', '“Esto se informará sin escuchar más detalles.”'],
    2,
    'La respuesta debe orientar la conversación hacia comprensión, aprendizaje y prevención.'),
  q('cert_relational_03', 'relational', 9,
    '¿Qué diferencia escuchar feedback de responder activamente?',
    ['Responder activamente implica aceptar todas las propuestas.', 'Implica cerrar el ciclo: actuar o explicar con transparencia por qué no se actuará.', 'Implica enviar una encuesta anual.', 'Implica derivar cada comentario a Recursos Humanos.'],
    1,
    'El feedback gana credibilidad cuando las personas conocen qué ocurrió con lo que compartieron.'),
  q('cert_relational_04', 'relational', 9,
    'Una idea del equipo no puede implementarse por restricciones legales. ¿Qué debería hacer el líder?',
    ['Ignorarla.', 'Rechazarla sin explicación.', 'Agradecer, explicar la restricción y explorar alternativas posibles.', 'Prometer implementarla igualmente.'],
    2,
    'Responder activamente no exige aceptar todo, pero sí explicar y mantener abierta la búsqueda de valor.'),
  q('cert_relational_05', 'relational', 10,
    '¿Qué significa socializar el diseño mediante conversaciones?',
    ['Enviar una metodología por correo.', 'Construir comprensión y adhesión a través de diálogos frecuentes, contextualizados y relacionales.', 'Organizar una única capacitación obligatoria.', 'Usar vocabulario técnico para demostrar expertise.'],
    1,
    'Las conversaciones continuas ayudan a adaptar el significado del diseño a diferentes roles y realidades.'),
  q('cert_relational_06', 'relational', 10,
    '¿Cuál es una buena práctica para introducir una nueva forma de trabajo?',
    ['Anunciarla como decisión cerrada.', 'Involucrar temprano a quienes serán afectados, escuchar objeciones y ajustar su aplicación.', 'Limitar la conversación a directores.', 'Evitar pilotos para no generar dudas.'],
    1,
    'La participación temprana reduce resistencia y mejora la calidad de la implementación.'),
  q('cert_relational_07', 'relational', 8,
    '¿Qué señal indica que un canal de feedback no es realmente seguro?',
    ['Las personas comparten opiniones diferentes.', 'Quienes plantean problemas reciben consecuencias negativas o quedan expuestos.', 'Se registran acuerdos y acciones.', 'Los líderes hacen preguntas para comprender.'],
    1,
    'Un canal deja de ser seguro cuando la honestidad tiene costos personales o profesionales.'),

  // 4. Diseño como identidad
  q('cert_identity_01', 'identity', 11,
    '¿Cuándo el diseño forma parte de la identidad organizacional?',
    ['Cuando aparece en la web institucional.', 'Cuando influye en valores, contratación, evaluación y decisiones de negocio.', 'Cuando existe un departamento creativo.', 'Cuando la empresa gana premios.'],
    1,
    'La identidad se evidencia cuando los valores de diseño afectan decisiones reales sobre personas y negocio.'),
  q('cert_identity_02', 'identity', 11,
    '¿Cuál es la evidencia más fuerte de que un valor centrado en usuarios está instalado?',
    ['Está escrito en una pared.', 'Se utiliza como criterio observable en selección, promoción y evaluación.', 'Se menciona en un newsletter.', 'Lo conoce únicamente la dirección.'],
    1,
    'Los valores se vuelven operativos cuando se traducen en criterios y comportamientos observables.'),
  q('cert_identity_03', 'identity', 12,
    '¿Quién es responsable de la centralidad en usuarios?',
    ['Solo diseño y experiencia.', 'Toda persona cuyas decisiones afecten a usuarios internos o externos.', 'Solo atención al cliente.', 'Únicamente la alta dirección.'],
    1,
    'La cultura design-led requiere que todas las funciones comprendan a quién sirven y cómo generan valor.'),
  q('cert_identity_04', 'identity', 12,
    '¿Cómo puede un equipo financiero aplicar centralidad en usuarios?',
    ['No puede, porque no trata con clientes.', 'Diseñando procesos claros y simples para clientes internos y externos, y entendiendo sus fricciones.', 'Eliminando controles obligatorios.', 'Delegando toda comunicación al área comercial.'],
    1,
    'Los usuarios también pueden ser internos; cualquier proceso puede diseñarse para reducir fricción sin perder rigor.'),
  q('cert_identity_05', 'identity', 13,
    '¿Qué significa servir al ecosistema completo de usuarios?',
    ['Optimizar solamente el momento de venta.', 'Considerar actores internos y externos, su contexto y las consecuencias a lo largo de la cadena de valor.', 'Priorizar siempre al usuario que paga.', 'Diseñar una solución igual para todos.'],
    1,
    'El ecosistema incluye a todas las personas afectadas antes, durante y después de la interacción principal.'),
  q('cert_identity_06', 'identity', 14,
    '¿Qué convierte la voz del usuario en una práctica sistemática?',
    ['Preguntar ocasionalmente a un cliente conocido.', 'Crear mecanismos continuos para recoger, analizar y representar evidencia en decisiones.', 'Leer comentarios solo cuando hay una crisis.', 'Usar la opinión del líder como sustituto.'],
    1,
    'La voz del usuario necesita procesos recurrentes y presencia en los espacios donde se toman decisiones.'),
  q('cert_identity_07', 'identity', 14,
    'En una reunión de producto, ¿qué práctica protege mejor la voz del usuario?',
    ['Tomar decisiones según jerarquía.', 'Presentar evidencia de usuarios, tensiones del journey y criterios de impacto antes de decidir.', 'Elegir la opción más rápida sin revisar consecuencias.', 'Invitar a un usuario una vez al año.'],
    1,
    'La evidencia debe estar disponible y ser considerada de manera explícita durante la decisión.'),

  // 5. Adopción del diseño
  q('cert_adoption_01', 'adoption', 15,
    '¿Qué ayuda a que el diseño sea accesible para toda la organización?',
    ['Aumentar el vocabulario técnico.', 'Traducirlo a comportamientos simples, herramientas disponibles y pasos concretos.', 'Reservarlo para especialistas.', 'Exigir un curso largo antes de probarlo.'],
    1,
    'La adopción crece cuando las personas entienden qué hacer y encuentran recursos fáciles de usar.'),
  q('cert_adoption_02', 'adoption', 15,
    '¿Cuál es un ejemplo de simplificar diseño sin vaciarlo de sentido?',
    ['Reducirlo a “hacer cosas lindas”.', 'Usar preguntas concretas como “¿qué sabemos del usuario?” y “¿qué evidencia respalda esto?”.', 'Eliminar investigación para ahorrar tiempo.', 'Usar una plantilla igual para cualquier problema.'],
    1,
    'Las señales simples pueden recordar comportamientos esenciales sin convertir el diseño en una caricatura.'),
  q('cert_adoption_03', 'adoption', 16,
    '¿Por qué conviene aplicar diseño a procesos internos?',
    ['Porque reemplaza toda política.', 'Porque la experiencia de colaboradores influye en su capacidad de crear buenas experiencias externas.', 'Porque solo mejora la estética del lugar de trabajo.', 'Porque evita medir productividad.'],
    1,
    'La experiencia interna condiciona cómo las personas colaboran y sirven a otros usuarios.'),
  q('cert_adoption_04', 'adoption', 16,
    'Un proceso interno genera retrabajo y frustración. ¿Cuál es el enfoque design-led?',
    ['Automatizarlo sin hablar con quienes lo usan.', 'Mapear el recorrido, escuchar a usuarios internos, identificar causas y probar mejoras.', 'Agregar más aprobaciones.', 'Pedir que las personas se adapten.'],
    1,
    'Diseñar internamente requiere comprender la experiencia y probar soluciones con quienes viven el proceso.'),
  q('cert_adoption_05', 'adoption', 17,
    '¿Qué significa empoderar con autonomía?',
    ['Dar libertad sin objetivos.', 'Definir propósito y límites, y delegar decisiones al nivel más cercano al usuario.', 'Eliminar toda supervisión.', 'Permitir que cada persona ignore procesos críticos.'],
    1,
    'La autonomía efectiva combina claridad de propósito, restricciones y capacidad real de decidir.'),
  q('cert_adoption_06', 'adoption', 18,
    '¿Qué convierte una capacitación en un ritual que refuerza cultura?',
    ['Que ocurra una vez y tenga mucha asistencia.', 'Que se repita, conecte con el trabajo real y promueva práctica, conversación y reconocimiento.', 'Que sea obligatoria y extensa.', 'Que se concentre solo en teoría.'],
    1,
    'La cultura se refuerza mediante experiencias consistentes y conectadas con comportamientos cotidianos.'),
  q('cert_adoption_07', 'adoption', 18,
    '¿Cuál de estas acciones sostiene mejor la adopción del diseño?',
    ['Un lanzamiento institucional aislado.', 'Huddles, mentorías, proyectos voluntarios y espacios periódicos de aprendizaje aplicado.', 'Una campaña de comunicación sin seguimiento.', 'Un manual que nadie revisa.'],
    1,
    'Los rituales recurrentes convierten principios abstractos en práctica compartida.'),

  // 6. Innovación por diseño
  q('cert_innovation_01', 'innovation', 19,
    '¿Qué significa “lanzar rápido, fallar rápido y aprender rápido”?',
    ['Publicar cualquier solución sin validación.', 'Probar una versión acotada para obtener evidencia temprana y mejorar.', 'Evitar planificación.', 'Aceptar errores repetidos sin corregir.'],
    1,
    'El objetivo es aprender temprano con un riesgo controlado, no actuar de manera descuidada.'),
  q('cert_innovation_02', 'innovation', 19,
    '¿Cuál es el mejor uso de un MVP?',
    ['Demostrar que la idea original era correcta.', 'Poner a prueba hipótesis críticas con el menor esfuerzo razonable.', 'Reemplazar definitivamente el producto final.', 'Evitar hablar con usuarios.'],
    1,
    'Un MVP existe para reducir incertidumbre sobre las hipótesis más importantes.'),
  q('cert_innovation_03', 'innovation', 20,
    '¿Por qué conviene integrar perspectivas diversas?',
    ['Para que todas las opiniones tengan el mismo peso sin evidencia.', 'Para descubrir riesgos, necesidades y oportunidades que un solo equipo puede no ver.', 'Para extender las reuniones.', 'Para evitar que alguien tome decisiones.'],
    1,
    'La diversidad aporta valor cuando se sintetiza en una solución coherente y orientada al usuario.'),
  q('cert_innovation_04', 'innovation', 20,
    'Un proyecto afecta operaciones, tecnología y clientes. ¿Cómo debería conformarse el equipo?',
    ['Solo con quienes idearon la solución.', 'Con representantes relevantes de esas áreas y una responsabilidad clara de decisión.', 'Solo con directores.', 'Con el mayor número posible de personas, sin roles definidos.'],
    1,
    'La colaboración transversal necesita las perspectivas correctas y claridad sobre cómo se decide.'),
  q('cert_innovation_05', 'innovation', 21,
    '¿Qué implica ser paciente con la ambigüedad?',
    ['Postergar indefinidamente cualquier decisión.', 'Explorar lo suficiente para entender el problema correcto antes de cerrar una solución.', 'Ignorar plazos y resultados comerciales.', 'Aceptar cualquier propuesta porque todavía no hay certeza.'],
    1,
    'La paciencia con la ambigüedad evita resolver rápido el problema equivocado sin impedir el avance.'),
  q('cert_innovation_06', 'innovation', 21,
    '¿Cómo puede una organización equilibrar operación e innovación?',
    ['Deteniendo la operación cotidiana.', 'Definiendo espacios, recursos y reglas distintas para excelencia operativa y experimentación.', 'Exigiendo resultados inmediatos a todo experimento.', 'Permitiendo experimentación en procesos críticos sin límites.'],
    1,
    'Diferentes tipos de trabajo requieren expectativas y controles apropiados a su nivel de incertidumbre.'),
  q('cert_innovation_07', 'innovation', 22,
    '¿Qué caracteriza una actitud agresiva hacia la mejora?',
    ['Cambiar por cambiar.', 'Buscar continuamente evidencia, feedback y oportunidades de mejorar la experiencia de usuarios.', 'Descartar todo lo anterior.', 'Aumentar la presión sin revisar procesos.'],
    1,
    'La mejora continua es proactiva, sistemática y guiada por las necesidades de usuarios.'),
];

const DIMENSION_ORDER: DimensionKey[] = [
  'visionary',
  'inspirational',
  'relational',
  'identity',
  'adoption',
  'innovation',
];

export function selectCertificationQuestions(attempt = 0) {
  const perDimension = CERTIFICATION_QUESTION_COUNT / DIMENSION_ORDER.length;
  const selectedByDimension = DIMENSION_ORDER.map((dimension, dimensionIndex) => {
    const pool = CERTIFICATION_QUESTIONS.filter((question) => question.dimension === dimension);
    const offset = Math.abs(attempt * 2 + dimensionIndex) % pool.length;
    const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
    return rotated.slice(0, perDimension);
  });

  const interleaved: CertificationQuestion[] = [];
  for (let position = 0; position < perDimension; position += 1) {
    for (const group of selectedByDimension) {
      if (group[position]) interleaved.push(group[position]);
    }
  }

  return interleaved;
}

export function gradeCertification(answers: Record<string, number>, attempt = 0) {
  const questions = selectCertificationQuestions(attempt);
  const results = questions.map((question) => ({
    id: question.id,
    dimension: question.dimension,
    correct: answers[question.id] === question.correctIndex,
    selectedIndex: answers[question.id],
    correctIndex: question.correctIndex,
    rationale: question.rationale,
  }));
  const correct = results.filter((result) => result.correct).length;
  const score = Math.round((correct / questions.length) * 100);
  const gaps = Array.from(new Set(results.filter((result) => !result.correct).map((result) => result.dimension)));

  return {
    score,
    passed: score >= CERTIFICATION_PASS_SCORE,
    correct,
    total: questions.length,
    gaps,
    results,
  };
}
