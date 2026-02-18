import { z } from 'zod'
import { DocumentType } from '@/types/common'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/config/constants'

// Upload Document Schema
export const uploadDocumentSchema = z.object({
  type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'Tipo de documento inválido' }),
  }),
  title: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  version: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>

// File validation schema
export const fileValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'El archivo no puede estar vacío')
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `El archivo no puede exceder ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file.type),
      'Solo se permiten archivos PDF y DOCX'
    ),
})

export type FileValidationInput = z.infer<typeof fileValidationSchema>

// Parse Document Schema
export const parseDocumentSchema = z.object({
  documentId: z.string().min(1, 'documentId es requerido'),
})

export type ParseDocumentInput = z.infer<typeof parseDocumentSchema>

// Update Document Schema
export const updateDocumentSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  version: z.string().optional(),
  parsedData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>
