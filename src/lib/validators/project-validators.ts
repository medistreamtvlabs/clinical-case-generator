import { z } from 'zod'
import { ProjectStatus } from '@/types/common'

// Create Project Schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().optional(),
  productName: z
    .string()
    .min(2, 'El nombre del producto es requerido')
    .max(100, 'El nombre del producto no puede exceder 100 caracteres'),
  activeIngredient: z.string().optional(),
  therapeuticAreas: z
    .array(z.string())
    .min(1, 'Debes seleccionar al menos una área terapéutica')
    .max(10, 'No puedes seleccionar más de 10 áreas'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

// Update Project Schema
export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  description: z.string().optional(),
  status: z
    .enum([ProjectStatus.SETUP, ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED])
    .optional(),
})

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// Update Configuration Schema
export const updateConfigurationSchema = z.object({
  mainIndications: z
    .array(z.string().min(1))
    .min(1, 'Debes tener al menos una indicación')
    .optional(),
  targetAudiences: z
    .array(z.string().min(1))
    .min(1, 'Debes tener al menos una audiencia objetivo')
    .optional(),
  availableLanguages: z.array(z.string()).optional(),
  systemPrompt: z.string().optional(),
  allowOffLabel: z.boolean().optional(),
  requireMedicalReview: z.boolean().optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(100).max(4000).optional(),
})

export type UpdateConfigurationInput = z.infer<typeof updateConfigurationSchema>
