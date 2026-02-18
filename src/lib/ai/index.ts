export {
  parseDocument,
  parseDocumentWithClaude,
  extractTextFromFile,
  extractTextFromPDF,
  extractTextFromDOCX,
  type DocumentParseResult,
  type ParsedDocumentContent,
} from './document-parser'

export { PARSING_PROMPTS, getParsingPrompt } from './prompts/parsing'

export {
  generateCaseWithClaude,
  generateCaseFromDocuments,
  validateCaseContent,
  enrichCaseContent,
  type GenerateCaseInput,
  type CaseGenerationResult,
} from './case-generator'

export {
  GENERATION_PROMPTS,
  getCaseGenerationPrompt,
  getCaseGenerationPromptByDocumentType,
} from './prompts/generation'
