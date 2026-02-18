/**
 * Prompts for Claude API document parsing
 * Different prompts for different document types
 */

export const PARSING_PROMPTS = {
  FICHA_TECNICA: `Analiza el siguiente documento de Ficha Técnica de un medicamento y extrae la información estructurada.

Extrae y organiza:
1. Nombre del medicamento
2. Principio activo (nombre genérico, dosis)
3. Forma farmacéutica (comprimido, solución inyectable, etc.)
4. Indicaciones terapéuticas (principales y secundarias)
5. Mecanismo de acción
6. Farmacocinética y farmacodinámica
7. Posología y forma de administración
8. Contraindicaciones
9. Reacciones adversas (clasificadas por frecuencia)
10. Interacciones medicamentosas
11. Precauciones especiales de uso
12. Información de almacenamiento

Responde en formato JSON estructurado.`,

  ESTUDIO_CLINICO: `Analiza el siguiente documento de Estudio Clínico y extrae la información relevante.

Extrae y organiza:
1. Título del estudio
2. Objetivo del estudio (primario y secundario)
3. Diseño del estudio (tipo, duración, fases)
4. Población estudiada (criterios de inclusión/exclusión, tamaño de muestra)
5. Intervención/Tratamiento
6. Grupo control (si aplica)
7. Principales hallazgos (resultados primarios y secundarios)
8. Conclusiones
9. Seguridad y tolerabilidad reportada
10. Relevancia clínica

Responde en formato JSON estructurado con énfasis en datos cuantitativos y hallazgos significativos.`,

  GUIA_CLINICA: `Analiza el siguiente documento de Guía Clínica y extrae recomendaciones y evidencia.

Extrae y organiza:
1. Nombre de la guía y entidad que la publica
2. Áreas clínicas cubiertas
3. Población objetivo
4. Recomendaciones principales (nivel de evidencia)
5. Algoritmos de diagnóstico
6. Algoritmos de tratamiento
7. Criterios de monitorización
8. Situaciones especiales (embarazo, edad avanzada, comorbilidades)
9. Derivación a especialista (criterios)
10. Referencias clínicas clave

Responde en formato JSON estructurado con nivel de evidencia (A, B, C) para cada recomendación.`,

  CASO_REFERENCIA: `Analiza el siguiente caso clínico de referencia y extrae elementos educativos.

Extrae y organiza:
1. Diagnóstico final
2. Presentación clínica (signos y síntomas)
3. Datos demográficos del paciente (edad, sexo, antecedentes)
4. Hallazgos de laboratorio/imagenología
5. Diagnóstico diferencial considerado
6. Tratamiento administrado y respuesta
7. Evolución clínica
8. Complicaciones (si las hubo)
9. Puntos de aprendizaje clave
10. Relevancia terapéutica

Responde en formato JSON estructurado.`,

  CONTEXTO_CLINICO: `Analiza el siguiente documento de contexto clínico y extrae información epidemiológica y clínica.

Extrae y organiza:
1. Condición clínica o enfermedad descrita
2. Epidemiología (incidencia, prevalencia, factores de riesgo)
3. Fisiopatología
4. Manifestaciones clínicas típicas
5. Métodos diagnósticos
6. Impacto en calidad de vida
7. Cargas de enfermedad
8. Opciones terapéuticas disponibles
9. Prognosis
10. Poblaciones especiales o consideraciones

Responde en formato JSON estructurado.`,

  COMPETENCIA: `Analiza el siguiente documento de competencia (sobre otro medicamento o tratamiento) y extrae información comparativa.

Extrae y organiza:
1. Nombre del medicamento/tratamiento competidor
2. Mecanismo de acción
3. Indicaciones principales
4. Perfiles de eficacia (si están disponibles)
5. Perfil de seguridad
6. Posología
7. Forma de administración
8. Consideraciones de costo/accesibilidad
9. Ventajas potenciales
10. Limitaciones o desventajas

Responde en formato JSON estructurado para facilitar comparación.`,
}

export function getParsingPrompt(documentType: string, filename: string): string {
  const basePrompt = PARSING_PROMPTS[documentType as keyof typeof PARSING_PROMPTS]
  if (!basePrompt) {
    return `Analiza el siguiente documento y extrae información relevante en formato JSON estructurado:\n\nArchivo: ${filename}`
  }
  return `${basePrompt}\n\nArchivo: ${filename}`
}
