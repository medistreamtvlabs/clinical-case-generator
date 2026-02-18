import path from 'path'
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS, ALLOWED_FILE_TYPES } from '@/config/constants'

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType)
}

/**
 * Validate file size
 */
export function validateFileSize(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= MAX_FILE_SIZE
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 255)
}

/**
 * Generate unique file path
 */
export function generateUniqueFilePath(
  projectId: string,
  originalFilename: string
): string {
  const sanitized = sanitizeFilename(originalFilename)
  const ext = path.extname(originalFilename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)

  const filename = `${timestamp}_${random}${ext}`
  return `uploads/${projectId}/${filename}`
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
  }
  return map[mimeType] || '.bin'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Extract text from buffer (placeholder - actual extraction done by parsers)
 */
export function isValidPDFHeader(buffer: Buffer): boolean {
  return buffer.toString('utf8', 0, 4) === '%PDF'
}

export function isValidDocxHeader(buffer: Buffer): boolean {
  // DOCX is a ZIP file, check for PK signature
  return buffer[0] === 0x50 && buffer[1] === 0x4b
}

/**
 * Validate file by checking magic bytes
 */
export function validateFileByMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === 'application/pdf') {
    return isValidPDFHeader(buffer)
  }
  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return isValidDocxHeader(buffer)
  }
  return false
}
