import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const articles = [
  {
    _id: "demo-project-agenda-2026",
    title: "ATDA presenta su agenda técnica 2026",
    slug: "atda-agenda-tecnica-2026",
    category: "Institucional",
    description:
      "La asociación prioriza soberanía tecnológica, vinculación con pymes y formación continua para el próximo año.",
    body: `La Asociación de Tecnólogos del Desarrollo Argentino presentó su agenda de trabajo para 2026, con foco en tres ejes: soberanía tecnológica, articulación público-privada y formación permanente.

En el encuentro institucional se destacó la necesidad de consolidar espacios de debate técnico que acompañen políticas de desarrollo productivo con mirada de largo plazo.

“Nuestro rol es aportar criterio técnico y construir consensos entre especialistas, empresas y el Estado”, señaló la comisión directiva.

Durante el año se fortalecerán mesas sectoriales, publicaciones periódicas y un ciclo abierto de cursos.`,
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80",
  },
  {
    _id: "demo-project-soberania",
    title: "Soberanía tecnológica: una columna de opinión",
    slug: "soberania-tecnologica-columna",
    category: "Opinión",
    description:
      "Sin capacidades locales de diseño, prueba y producción, el desarrollo industrial queda atado a agendas externas.",
    body: `Hablar de soberanía tecnológica no es una consigna abstracta: es la capacidad concreta de diseñar, ensayar, producir y mantener soluciones críticas en el país.

Cuando esas capacidades se debilitan, también se debilita la autonomía productiva. Argentina necesita redes de conocimiento que conecten universidades, centros tecnológicos y empresas.

Desde ATDA impulsamos una mirada pragmática: estándares abiertos, formación de talentos y transferencia real al tejido productivo.

La pregunta no es si podemos comprar tecnología. La pregunta es si podemos comprenderla, adaptarla y mejorarla.`,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80",
  },
  {
    _id: "demo-project-pymes",
    title: "Nuevo convenio de asistencia técnica con pymes industriales",
    slug: "convenio-asistencia-pymes",
    category: "Industria",
    description:
      "El acuerdo busca acercar diagnósticos técnicos, mejores prácticas y capacitación a empresas de base manufacturera.",
    body: `ATDA firmó un convenio de asistencia técnica orientado a pymes industriales que buscan modernizar procesos, incorporar digitalización y mejorar la calidad de sus productos.

El programa incluye relevamientos en planta, talleres de mejora continua y acompañamiento para la adopción de tecnologías maduras.

Las primeras convocatorias se abrirán en las regiones con mayor densidad manufacturera, con cupos limitados y seguimiento de resultados.

El objetivo es claro: transformar conocimiento técnico en competitividad concreta.`,
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=80",
  },
  {
    _id: "demo-project-energia",
    title: "Mesa de trabajo sobre transición energética y desarrollo",
    slug: "mesa-transicion-energetica",
    category: "Energía",
    description:
      "Especialistas debatieron infraestructura, almacenamiento y oportunidades de valor agregado local.",
    body: `Se realizó una mesa de trabajo sobre transición energética con participación de tecnólogos, referentes del sector y equipos de planificación.

El intercambio abordó infraestructura de red, almacenamiento, electrificación industrial y el rol de los proveedores locales en la cadena de valor.

Entre las conclusiones, se subrayó la importancia de planificar con horizonte de décadas y de articular inversión pública con capacidades tecnológicas nacionales.

ATDA publicará un documento de aportes técnicos a partir de las discusiones de la jornada.`,
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    _id: "demo-project-cursos",
    title: "Arranca el ciclo de cursos ATDA del primer semestre",
    slug: "ciclo-cursos-primer-semestre",
    category: "Capacitaciones",
    description:
      "Las formaciones combinan fundamentos técnicos, casos reales y herramientas aplicables al trabajo diario.",
    body: `El nuevo ciclo de cursos de ATDA ya tiene fechas confirmadas para el primer semestre. Las propuestas abarcan industria 4.0, gestión de la innovación y herramientas digitales para equipos técnicos.

Cada curso incluye material descargable, espacios de consulta y un enfoque práctico orientado a problemas reales del sector productivo.

Las inscripciones se realizan desde la web institucional, con pago habilitado a través de MODO.

Quienes completen el trayecto recibirán constancia de participación emitida por la asociación.`,
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=80",
  },
];

async function main() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("Faltan variables de Sanity");
  }

  for (const article of articles) {
    await client.createOrReplace({
      _id: article._id,
      _type: "project",
      title: article.title,
      slug: { _type: "slug", current: article.slug },
      category: article.category,
      description: article.description,
      body: article.body,
      imageUrl: article.imageUrl,
      published: true,
    });
    console.log(`OK: ${article.slug}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
