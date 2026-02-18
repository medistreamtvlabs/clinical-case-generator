/**
 * Prompts for clinical case generation using Claude AI
 * Different prompts for different document types and educational contexts
 */

export const GENERATION_PROMPTS = {
  GENERIC: `Genera un caso clínico educativo completo y bien estructurado en español.

Estructura el caso en las siguientes secciones y devuelve un objeto JSON válido con esta estructura exacta:

{
  "presentation": {
    "demographics": {
      "age": "edad en años",
      "sex": "M/F",
      "occupation": "profesión/ocupación"
    },
    "chiefComplaint": "motivo principal de consulta",
    "historyOfPresentIllness": "descripción detallada de síntomas y evolución",
    "pastMedicalHistory": ["antecedente 1", "antecedente 2"],
    "medications": [
      {
        "name": "nombre del medicamento",
        "dose": "dosis",
        "frequency": "frecuencia"
      }
    ],
    "allergies": ["alergia 1"],
    "familyHistory": "historia familiar relevante",
    "socialHistory": "historia social relevante"
  },
  "clinicalData": {
    "physicalExamination": "hallazgos del examen físico",
    "vitalSigns": {
      "temperature": "temperatura en °C",
      "heartRate": "frecuencia cardíaca en bpm",
      "bloodPressure": "presión arterial",
      "respiratoryRate": "frecuencia respiratoria"
    },
    "laboratoryResults": [
      {
        "test": "nombre de prueba",
        "result": "valor resultado",
        "unit": "unidad",
        "referenceRange": "rango normal"
      }
    ],
    "otherTests": [
      {
        "test": "nombre de otro test",
        "result": "hallazgo principal"
      }
    ]
  },
  "clinicalQuestion": {
    "question": "pregunta clínica desafiante pero educativa",
    "options": [
      {
        "id": "A",
        "text": "opción A - respuesta plausible pero incorrecta",
        "isCorrect": false
      },
      {
        "id": "B",
        "text": "opción B - respuesta plausible pero incorrecta",
        "isCorrect": false
      },
      {
        "id": "C",
        "text": "opción C - respuesta CORRECTA",
        "isCorrect": true
      },
      {
        "id": "D",
        "text": "opción D - respuesta plausible pero incorrecta",
        "isCorrect": false
      }
    ],
    "correctAnswer": "C",
    "explanation": "explicación detallada de por qué C es correcta y análisis de otros errores comunes",
    "references": [
      {
        "type": "guideline|study|textbook",
        "section": "sección relevante",
        "quote": "cita textual si aplica"
      }
    ]
  },
  "educationalNotes": {
    "keyPoints": [
      "punto de aprendizaje clave 1",
      "punto de aprendizaje clave 2",
      "punto de aprendizaje clave 3"
    ],
    "commonMistakes": [
      "error común en diagnóstico",
      "error común en manejo",
      "error común en seguimiento"
    ],
    "clinicalTips": [
      "consejo práctico 1",
      "consejo práctico 2"
    ]
  }
}

Asegúrate que:
1. El caso sea clínicamente realista y educativamente valioso
2. Los datos sean internamente consistentes
3. La pregunta sea desafiante pero justa
4. La explicación sea educativa y cite fundamentos clínicos
5. Los puntos educacionales sean claros y accionables`,

  FICHA_TECNICA: `Genera un caso clínico educativo enfocado en el medicamento, basado en su Ficha Técnica.

El caso debe:
1. Presentar un paciente que se beneficiaría del medicamento
2. Incluir indicaciones clásicas del medicamento
3. Mostrar criterios de inclusión/exclusión del medicamento
4. Incorporar manejo de efectos adversos reales del medicamento
5. Demostrar seguimiento y monitorización apropiados

Estructura el caso en JSON con esta estructura (devuelve un objeto JSON válido):

{
  "presentation": {
    "demographics": { "age": "", "sex": "", "occupation": "" },
    "chiefComplaint": "",
    "historyOfPresentIllness": "",
    "pastMedicalHistory": [],
    "medications": [],
    "allergies": [],
    "familyHistory": "",
    "socialHistory": ""
  },
  "clinicalData": {
    "physicalExamination": "",
    "vitalSigns": { "temperature": "", "heartRate": "", "bloodPressure": "", "respiratoryRate": "" },
    "laboratoryResults": [],
    "otherTests": []
  },
  "clinicalQuestion": {
    "question": "Pregunta sobre indicación, dosificación o monitorización del medicamento",
    "options": [
      { "id": "A", "text": "opción", "isCorrect": false },
      { "id": "B", "text": "opción", "isCorrect": false },
      { "id": "C", "text": "opción CORRECTA", "isCorrect": true },
      { "id": "D", "text": "opción", "isCorrect": false }
    ],
    "correctAnswer": "C",
    "explanation": "Explicación basada en Ficha Técnica",
    "references": [
      { "type": "guideline", "section": "Indicaciones", "quote": "cita de Ficha Técnica" }
    ]
  },
  "educationalNotes": {
    "keyPoints": ["punto sobre indicaciones", "punto sobre dosificación", "punto sobre seguridad"],
    "commonMistakes": ["error común con medicamento"],
    "clinicalTips": ["consejo práctico de uso"]
  }
}`,

  ESTUDIO_CLINICO: `Genera un caso clínico basado en un Estudio Clínico, demostrando su relevancia práctica.

El caso debe:
1. Incluir criterios de inclusión del estudio
2. Mostrar población típica del estudio
3. Demostrar tratamiento/intervención del estudio
4. Incorporar outcomes reportados en el estudio
5. Contextualizar evidencia en práctica clínica

Estructura el caso en JSON con esta estructura exacta:

{
  "presentation": {
    "demographics": { "age": "", "sex": "", "occupation": "" },
    "chiefComplaint": "",
    "historyOfPresentIllness": "",
    "pastMedicalHistory": [],
    "medications": [],
    "allergies": [],
    "familyHistory": "",
    "socialHistory": ""
  },
  "clinicalData": {
    "physicalExamination": "",
    "vitalSigns": { "temperature": "", "heartRate": "", "bloodPressure": "", "respiratoryRate": "" },
    "laboratoryResults": [],
    "otherTests": []
  },
  "clinicalQuestion": {
    "question": "Pregunta sobre interpretación o aplicación del estudio",
    "options": [
      { "id": "A", "text": "opción", "isCorrect": false },
      { "id": "B", "text": "opción", "isCorrect": false },
      { "id": "C", "text": "opción CORRECTA", "isCorrect": true },
      { "id": "D", "text": "opción", "isCorrect": false }
    ],
    "correctAnswer": "C",
    "explanation": "Explicación basada en hallazgos del estudio",
    "references": [
      { "type": "study", "section": "Resultados principales", "quote": "hallazgo clave del estudio" }
    ]
  },
  "educationalNotes": {
    "keyPoints": ["evidencia del estudio", "limitaciones relevantes", "aplicación clínica"],
    "commonMistakes": ["extrapolación incorrecta", "sesgo de selección"],
    "clinicalTips": ["cómo usar la evidencia en práctica"]
  }
}`,

  GUIA_CLINICA: `Genera un caso clínico que demuestra adherencia a una Guía Clínica.

El caso debe:
1. Seguir algoritmos diagnósticos de la guía
2. Aplicar recomendaciones de tratamiento de la guía
3. Demostrar monitorización según guía
4. Incluir poblaciones especiales mencionadas en guía
5. Mostrar criterios de derivación/escalada

Estructura el caso en JSON:

{
  "presentation": {
    "demographics": { "age": "", "sex": "", "occupation": "" },
    "chiefComplaint": "",
    "historyOfPresentIllness": "",
    "pastMedicalHistory": [],
    "medications": [],
    "allergies": [],
    "familyHistory": "",
    "socialHistory": ""
  },
  "clinicalData": {
    "physicalExamination": "",
    "vitalSigns": { "temperature": "", "heartRate": "", "bloodPressure": "", "respiratoryRate": "" },
    "laboratoryResults": [],
    "otherTests": []
  },
  "clinicalQuestion": {
    "question": "Pregunta sobre seguimiento de algoritmo o recomendación de guía",
    "options": [
      { "id": "A", "text": "opción no según guía", "isCorrect": false },
      { "id": "B", "text": "opción no según guía", "isCorrect": false },
      { "id": "C", "text": "opción SEGÚN GUÍA", "isCorrect": true },
      { "id": "D", "text": "opción", "isCorrect": false }
    ],
    "correctAnswer": "C",
    "explanation": "Explicación basada en recomendación de guía",
    "references": [
      { "type": "guideline", "section": "Diagnóstico/Tratamiento", "quote": "recomendación de guía" }
    ]
  },
  "educationalNotes": {
    "keyPoints": ["algoritmo paso a paso", "nivel de recomendación", "cuándo escalizar"],
    "commonMistakes": ["desviación de guía común", "interpretación incorrecta"],
    "clinicalTips": ["cómo aplicar en práctica"]
  }
}`,
}

export function getCaseGenerationPrompt(complexity: string, indication: string): string {
  const basePrompt = GENERATION_PROMPTS.GENERIC

  // Add complexity-specific guidance
  let complexityGuidance = ''
  if (complexity === 'BASIC') {
    complexityGuidance = `
Nivel de complejidad BÁSICO:
- Presentación clásica y fácilmente reconocible
- Diagnóstico directo sin grandes distractores
- Tratamiento estándar de primer línea
- Evolución predecible y positiva
`
  } else if (complexity === 'INTERMEDIATE') {
    complexityGuidance = `
Nivel de complejidad INTERMEDIO:
- Presentación parcialmente atípica con algunos distractores
- Diagnóstico requiere síntesis de varios hallazgos
- Manejo requiere ajustes basados en comorbilidades
- Complicación menor durante evolución que requiere manejo adicional
`
  } else if (complexity === 'ADVANCED') {
    complexityGuidance = `
Nivel de complejidad AVANZADO:
- Presentación atípica con múltiples distractores
- Diagnóstico diferencial amplio y desafiante
- Múltiples comorbilidades afectando manejo
- Complicación significativa o desenlace inesperado
- Requiere pensamiento crítico y síntesis de múltiples especialidades
`
  }

  // Add indication-specific context
  let indicationGuidance = ''
  if (indication) {
    indicationGuidance = `

Indicación/Diagnóstico enfocado: ${indication}
- Asegurate que el caso sea clínicamente realista para esta indicación
- Incluye hallazgos típicos pero educativamente valiosos
- La pregunta debe evaluar conocimiento relevante a esta indicación`
  }

  return basePrompt + complexityGuidance + indicationGuidance
}

export function getCaseGenerationPromptByDocumentType(
  documentType: string,
  complexity: string,
  indication: string
): string {
  const basePrompt = GENERATION_PROMPTS[documentType as keyof typeof GENERATION_PROMPTS] || GENERATION_PROMPTS.GENERIC

  let complexityGuidance = ''
  if (complexity === 'BASIC') {
    complexityGuidance = `

NIVEL BÁSICO: Caso fácil de reconocer con diagnóstico directo.`
  } else if (complexity === 'INTERMEDIATE') {
    complexityGuidance = `

NIVEL INTERMEDIO: Caso con algunos distractores que requiere síntesis de hallazgos.`
  } else if (complexity === 'ADVANCED') {
    complexityGuidance = `

NIVEL AVANZADO: Caso complejo con presentación atípica y manejo desafiante.`
  }

  let indicationGuidance = ''
  if (indication) {
    indicationGuidance = `

Enfoque en: ${indication}`
  }

  return basePrompt + complexityGuidance + indicationGuidance
}
