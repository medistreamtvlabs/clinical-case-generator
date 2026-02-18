/**
 * Document parsing service using Claude API
 * Handles text extraction and AI-powered content analysis
 */

import Anthropic from '@anthropic-ai/sdk'
import { getParsingPrompt } from './prompts/parsing'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ParsedDocumentContent {
  [key: string]: any
}

export interface DocumentParseResult {
  success: boolean
  content?: ParsedDocumentContent
  rawText?: string
  error?: string
  processingTimeMs?: number
  tokensUsed?: {
    input: number
    output: number
  }
}

/**
 * Extract text from PDF buffer
 * Note: In production, use pdf-parse library
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // For now, return a placeholder
  // In production, integrate with pdf-parse:
  // const pdfParse = require('pdf-parse')
  // const data = await pdfParse(buffer)
  // return data.text
  return '[PDF parsing not yet implemented - configure pdf-parse library]'
}

/**
 * Extract text from DOCX buffer
 * Note: In production, use mammoth library
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  // For now, return a placeholder
  // In production, integrate with mammoth:
  // const mammoth = require('mammoth')
  // const result = await mammoth.extractRawText({ buffer })
  // return result.value
  return '[DOCX parsing not yet implemented - configure mammoth library]'
}

/**
 * Extract text based on file type
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer)
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromDOCX(buffer)
  }

  // Fallback to UTF-8 text
  return buffer.toString('utf-8')
}

/**
 * Parse document content using Claude API
 */
export async function parseDocumentWithClaude(
  extractedText: string,
  documentType: string,
  filename: string
): Promise<DocumentParseResult> {
  const startTime = Date.now()

  try {
    const prompt = getParsingPrompt(documentType, filename)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\n---\n\nDOCUMENTO A ANALIZAR:\n\n${extractedText}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Try to parse JSON from response
    let parsedContent: ParsedDocumentContent = {}
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        parsedContent = { raw_response: responseText }
      }
    } catch {
      parsedContent = { raw_response: responseText }
    }

    const processingTimeMs = Date.now() - startTime

    return {
      success: true,
      content: parsedContent,
      rawText: responseText,
      processingTimeMs,
      tokensUsed: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      },
    }
  } catch (error) {
    const processingTimeMs = Date.now() - startTime
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during parsing'

    return {
      success: false,
      error: errorMessage,
      processingTimeMs,
    }
  }
}

/**
 * Full document parsing pipeline
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string,
  documentType: string
): Promise<DocumentParseResult> {
  try {
    // Step 1: Extract text
    const extractedText = await extractTextFromFile(buffer, mimeType, filename)

    // Step 2: Parse with Claude
    const result = await parseDocumentWithClaude(
      extractedText,
      documentType,
      filename
    )

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during document parsing'

    return {
      success: false,
      error: errorMessage,
    }
  }
}
