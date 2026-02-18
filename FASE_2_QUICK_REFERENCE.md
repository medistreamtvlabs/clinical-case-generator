# FASE 2: Document Management - Quick Reference

## 🎯 What Was Built

A complete document upload, validation, and AI-powered parsing system that extracts structured information from medical documents (PDF, DOCX) and prepares data for clinical case generation.

## 📂 File Structure

```
src/
├── lib/
│   ├── ai/
│   │   ├── document-parser.ts        # Document parsing with Claude
│   │   ├── prompts/
│   │   │   └── parsing.ts            # Document-type-specific prompts
│   │   └── index.ts                  # AI module exports
│   ├── validators/
│   │   └── document-validators.ts    # Zod schemas for validation
│   └── utils/
│       └── file-utils.ts             # File operations & validation
├── app/api/projects/[projectId]/
│   └── documents/
│       ├── route.ts                  # GET list, POST upload
│       ├── [documentId]/
│       │   ├── route.ts              # GET, PATCH, DELETE
│       │   └── parse/
│       │       └── route.ts          # POST to trigger parsing
│       └── [documentId]/
│           └── page.tsx              # Document detail page
├── components/documents/
│   ├── DocumentUpload.tsx             # Upload form component
│   ├── DocumentCard.tsx               # Document card display
│   ├── DocumentList.tsx               # Document list grid
│   └── index.ts                       # Component exports
└── app/(dashboard)/projects/
    └── [projectId]/documents/
        ├── page.tsx                  # Documents list page
        └── [documentId]/page.tsx     # Document detail page
```

## 🔌 API Endpoints

### List & Upload Documents
```
GET  /api/projects/:projectId/documents?page=1&limit=10&type=FICHA_TECNICA&status=PENDING
POST /api/projects/:projectId/documents
     Body: FormData { file, title, type, version?, metadata? }
```

### Document Detail
```
GET    /api/projects/:projectId/documents/:documentId
PATCH  /api/projects/:projectId/documents/:documentId
       Body: { title?, version?, metadata? }
DELETE /api/projects/:projectId/documents/:documentId
```

### Parsing
```
POST /api/projects/:projectId/documents/:documentId/parse
     Returns: { status: 202, data: { id, title, parsingStatus: 'PROCESSING' } }
```

## 🎨 UI Components

### DocumentUpload
```jsx
<DocumentUpload
  projectId="project-123"
  onSuccess={(docId) => console.log('Uploaded:', docId)}
  onError={(err) => console.error(err)}
/>
```

### DocumentCard
```jsx
<DocumentCard
  id="doc-123"
  projectId="project-123"
  title="Ficha Técnica - Medicamento X"
  type="FICHA_TECNICA"
  filename="drug-sheet.pdf"
  fileSize={2048576}
  parsingStatus="COMPLETED"
  createdAt={new Date()}
  onDelete={(id) => handleDelete(id)}
  onParse={(id) => handleParse(id)}
/>
```

### DocumentList
```jsx
<DocumentList
  projectId="project-123"
  refreshTrigger={updateCount}
/>
```

## 🔐 Validation

### File Validation
- ✅ Type: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- ✅ Extension: .pdf, .docx
- ✅ Size: Max 10MB
- ✅ Magic Bytes: PDF (%PDF), DOCX (PK ZIP signature)

### Document Metadata
- Title: 5-200 characters
- Type: FICHA_TECNICA | ESTUDIO_CLINICO | GUIA_CLINICA | CASO_REFERENCIA | CONTEXTO_CLINICO | COMPETENCIA
- Version: String (optional)
- Metadata: JSON object (optional)

## 🤖 AI Parsing Prompts

Each document type has a specialized Claude prompt:

### FICHA_TECNICA (Drug Sheet)
Extracts: name, active ingredient, dosage, indications, contraindications, adverse reactions, interactions, storage

### ESTUDIO_CLINICO (Clinical Study)
Extracts: objectives, study design, population, results, conclusions, efficacy data, safety profile

### GUIA_CLINICA (Clinical Guidelines)
Extracts: recommendations, diagnostic algorithms, treatment algorithms, evidence levels, special populations

### CASO_REFERENCIA (Reference Case)
Extracts: diagnosis, clinical presentation, diagnostic findings, treatment, outcome, learning points

### CONTEXTO_CLINICO (Clinical Context)
Extracts: epidemiology, pathophysiology, clinical manifestations, diagnostic methods, treatment options, prognosis

### COMPETENCIA (Competitor Analysis)
Extracts: competitor info, mechanism of action, efficacy, safety, administration, cost considerations

## 🔄 Status Flow

```
PENDING
   ↓ (user clicks "Process")
PROCESSING
   ↓ (AI completes)
COMPLETED or FAILED
   ↓ (if failed)
[user can retry]
```

## 💾 Data Models

### Document (Prisma)
```typescript
{
  id: string              // UUID
  projectId: string       // FK to Project
  title: string           // User-given title
  type: DocumentType      // FICHA_TECNICA, etc.
  filename: string        // Sanitized uploaded filename
  fileSize: number        // Bytes
  mimeType: string        // application/pdf, etc.
  parsingStatus: ParsingStatus  // PENDING, PROCESSING, COMPLETED, FAILED
  version: string         // "1.0"
  metadata: JSON          // Custom metadata
  parsedData: JSON        // Extracted data from Claude
  errorMessage?: string   // If FAILED
  createdAt: DateTime
  updatedAt: DateTime
}
```

## 🚀 Usage Example

```typescript
// 1. Upload document
const form = new FormData()
form.append('file', file)
form.append('title', 'Ficha Técnica - Medicamento X')
form.append('type', 'FICHA_TECNICA')

const uploadRes = await fetch(
  `/api/projects/project-123/documents`,
  { method: 'POST', body: form }
)
const { data: doc } = await uploadRes.json()

// 2. Trigger parsing
const parseRes = await fetch(
  `/api/projects/project-123/documents/${doc.id}/parse`,
  { method: 'POST' }
)

// 3. Poll for completion (or use WebSocket in production)
const statusRes = await fetch(
  `/api/projects/project-123/documents/${doc.id}`
)
const { data } = await statusRes.json()
console.log('Parsing status:', data.parsingStatus)
console.log('Parsed data:', data.parsedData)
```

## 🔗 Integration Points for FASE 3

1. **Document Data → Case Generation**
   - Use parsed document data as context for Claude prompts
   - Map extracted information to case structure

2. **Background Job Queue**
   - Replace synchronous parsing with async queue (Bull, RabbitMQ)
   - Implement webhooks for status updates

3. **File Storage**
   - Implement actual file persistence (AWS S3, local storage)
   - Add file download capability

4. **Real-time Updates**
   - Add WebSocket for live parsing status
   - Implement server-sent events (SSE)

## 🐛 Common Issues & Solutions

### Document Not Parsing
- Check file is actually PDF/DOCX (not renamed)
- Verify ANTHROPIC_API_KEY is set
- Check file size < 10MB
- Review error message in document detail page

### Upload Fails
- Ensure file extension is .pdf or .docx
- Check MIME type is correct
- Verify file not corrupted
- Check disk space for uploads directory

### Slow Parsing
- Expected for large documents (2-5 minutes)
- Implement background job queue for better UX
- Consider file preprocessing (extract pages, summarize)

---

**Ready to move to FASE 3 - Clinical Case Generation!**
