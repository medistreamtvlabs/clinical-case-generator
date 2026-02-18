/**
 * Validation schemas for clinical case operations
 * Using Zod for runtime schema validation
 */

import { z } from 'zod'

/**
 * Generate case request validation
 */
export const generateCaseSchema = z.object({
  indication: z
    .string()
    .min(3, 'Indicación debe tener al menos 3 caracteres')
    .max(200, 'Indicación no puede exceder 200 caracteres'),

  complexity: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED'], {
    errorMap: () => ({
      message: 'Complejidad debe ser BÁSICA, INTERMEDIA o AVANZADA',
    }),
  }),

  educationalObjective: z
    .string()
    .min(10, 'Objetivo educativo debe tener al menos 10 caracteres')
    .max(500, 'Objetivo educativo no puede exceder 500 caracteres'),

  targetAudience: z
    .array(z.string())
    .min(1, 'Al menos una audiencia debe ser seleccionada')
    .max(10, 'No puedes seleccionar más de 10 audiencias'),

  language: z
    .enum(['es', 'en'])
    .default('es')
    .optional(),

  additionalRequirements: z
    .string()
    .max(1000, 'Requisitos adicionales no pueden exceder 1000 caracteres')
    .optional(),

  documentIds: z
    .array(z.string().cuid('ID de documento inválido'))
    .optional(),
})

export type GenerateCaseInput = z.infer<typeof generateCaseSchema>

/**
 * Update case request validation
 */
export const updateCaseSchema = z.object({
  title: z
    .string()
    .min(5, 'Título debe tener al menos 5 caracteres')
    .max(200, 'Título no puede exceder 200 caracteres')
    .optional(),

  indication: z
    .string()
    .min(3, 'Indicación debe tener al menos 3 caracteres')
    .max(200, 'Indicación no puede exceder 200 caracteres')
    .optional(),

  complexity: z
    .enum(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
    .optional(),

  educationalObjective: z
    .string()
    .min(10, 'Objetivo educativo debe tener al menos 10 caracteres')
    .max(500, 'Objetivo educativo no puede exceder 500 caracteres')
    .optional(),

  targetAudience: z
    .array(z.string())
    .min(1, 'Al menos una audiencia debe ser seleccionada')
    .max(10, 'No puedes seleccionar más de 10 audiencias')
    .optional(),

  content: z.record(z.any()).optional(),

  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'ARCHIVED',
    ])
    .optional(),

  validated: z.boolean().optional(),
})

export type UpdateCaseInput = z.infer<typeof updateCaseSchema>

/**
 * Rate case request validation
 */
export const rateCaseSchema = z.object({
  rating: z
    .number()
    .int('Rating debe ser un número entero')
    .min(1, 'Rating debe ser al menos 1')
    .max(5, 'Rating no puede exceder 5'),

  feedback: z
    .string()
    .max(500, 'Feedback no puede exceder 500 caracteres')
    .optional(),
})

export type RateCaseInput = z.infer<typeof rateCaseSchema>

/**
 * Add comment request validation
 */
export const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comentario no puede estar vacío')
    .max(2000, 'Comentario no puede exceder 2000 caracteres'),

  author: z
    .string()
    .min(1, 'Autor requerido')
    .max(100, 'Nombre de autor no puede exceder 100 caracteres')
    .optional(),
})

export type AddCommentInput = z.infer<typeof addCommentSchema>

/**
 * Publish case request validation
 */
export const publishCaseSchema = z.object({
  message: z
    .string()
    .max(500, 'Mensaje de publicación no puede exceder 500 caracteres')
    .optional(),
})

export type PublishCaseInput = z.infer<typeof publishCaseSchema>

/**
 * Query validation for case list
 */
export const listCasesQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page debe ser un número entero')
    .min(1, 'Page debe ser al menos 1')
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit debe ser un número entero')
    .min(1, 'Limit debe ser al menos 1')
    .max(100, 'Limit no puede exceder 100')
    .default(10),

  status: z
    .enum([
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'ARCHIVED',
    ])
    .optional(),

  complexity: z
    .enum(['BASIC', 'INTERMEDIATE', 'ADVANCED'])
    .optional(),

  indication: z
    .string()
    .max(200, 'Indicación para búsqueda no puede exceder 200 caracteres')
    .optional(),

  search: z
    .string()
    .max(100, 'Búsqueda no puede exceder 100 caracteres')
    .optional(),

  sort: z
    .enum(['newest', 'oldest', 'rating', 'views', 'title'])
    .default('newest')
    .optional(),
})

export type ListCasesQuery = z.infer<typeof listCasesQuerySchema>
