# FASE 2: Document Management - Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLINICAL CASE GENERATOR                          │
│                                                                           │
│                    FASE 2: Document Management System                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌────────────────────┐       ┌────────────────────┐                    │
│  │  Documents Page    │       │  Document Detail   │                    │
│  │  (List & Upload)   │       │  Page              │                    │
│  │                    │───────│                    │                    │
│  │ - Upload button    │       │ - File info        │                    │
│  │ - Document grid    │       │ - Parse status     │                    │
│  │ - Filter/search    │       │ - Parsed data      │                    │
│  │ - Sort by date     │       │ - Error details    │                    │
│  └─────┬──────────────┘       └────────┬───────────┘                    │
│        │                              │                                 │
└───────┼──────────────────────────────┼─────────────────────────────────┘
        │                              │
        ├──────────────────┬───────────┤
        │                  │           │
┌───────▼──────┐  ┌────────▼──────┐   │
│ DocumentCard │  │DocumentUpload  │   │
│ Component    │  │Form Component  │   │
└───────┬──────┘  └────────┬──────┘   │
        │                  │           │
        ├──────────────────┼───────────┤
        │                  │           │
┌───────▼──────────────────▼───────────▼──────────────────────────────────┐
│                      COMPONENT LOGIC LAYER                               │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  DocumentUpload        DocumentCard          DocumentList                │
│  ─────────────        ────────────          ──────────────               │
│  • Form handling      • Status display      • Fetch list                 │
│  • File drag & drop   • Delete action       • Grid layout                │
│  • Validation         • Parse trigger       • Pagination                 │
│  • API calls          • Error handling      • Refresh                    │
│  • Error display      • Navigation link     • Loading state              │
│                                                                            │
└──────────────────────────┬────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
┌──────────▼─────┐  ┌──────▼──────┐  ┌────▼──────────┐
│ GET /documents │  │ POST upload  │  │ POST parse    │
│ (list)         │  │              │  │ (trigger)     │
└────────────────┘  └──────┬───────┘  └────┬──────────┘
                           │                │
                   ┌───────▼────────────────▼────────┐
                   │                                 │
┌──────────────────▼──────────────────────────────────▼──────────────────┐
│                       API LAYER (Next.js Routes)                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  GET    /api/projects/:id/documents (list + pagination)               │
│         ├─ Validate project exists                                    │
│         ├─ Query database with filters                                │
│         └─ Return paginated documents                                 │
│                                                                         │
│  POST   /api/projects/:id/documents (upload)                          │
│         ├─ Parse FormData (title, type, file)                         │
│         ├─ Validate with uploadDocumentSchema (Zod)                   │
│         ├─ Validate file (size, type, extension, magic bytes)         │
│         ├─ Sanitize filename                                          │
│         ├─ Create document record (status: PENDING)                   │
│         └─ Return created document                                    │
│                                                                         │
│  GET    /api/projects/:id/documents/:docId (detail)                   │
│         ├─ Query document                                             │
│         └─ Return full details                                        │
│                                                                         │
│  PATCH  /api/projects/:id/documents/:docId (update)                   │
│         ├─ Validate with updateDocumentSchema                         │
│         ├─ Update fields (title, version, metadata)                   │
│         └─ Return updated document                                    │
│                                                                         │
│  DELETE /api/projects/:id/documents/:docId (delete)                   │
│         ├─ Verify document exists                                     │
│         ├─ Delete from database                                       │
│         └─ Return success                                             │
│                                                                         │
│  POST   /api/projects/:id/documents/:docId/parse (parse)              │
│         ├─ Verify document exists                                     │
│         ├─ Update status to PROCESSING                                │
│         ├─ [TODO: Queue for background job]                           │
│         └─ Return 202 Accepted                                        │
│                                                                         │
└────────┬─────────────────────────────────────────────────┬────────────┘
         │                                                 │
         ├─────────────────────────────────────────────────┤
         │                                                 │
┌────────▼──────────────────────────────────────────────────▼────────┐
│                      BUSINESS LOGIC LAYER                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Validators (Zod Schemas)                                         │
│  ──────────────────────────                                       │
│  • uploadDocumentSchema: title, type, file validations           │
│  • updateDocumentSchema: optional field updates                  │
│  • parseDocumentSchema: document ID validation                   │
│  • fileValidationSchema: File instance & size checks             │
│                                                                    │
│  File Utilities                                                    │
│  ──────────────                                                    │
│  • validateFileType(): Check MIME type                           │
│  • validateFileSize(): Check 10MB limit                          │
│  • validateFileExtension(): Check .pdf, .docx                    │
│  • sanitizeFilename(): Remove dangerous characters               │
│  • formatFileSize(): Convert bytes to human format               │
│  • validateFileByMagicBytes(): Check PDF/DOCX signatures         │
│                                                                    │
│  AI Parser Service                                                 │
│  ──────────────────                                                │
│  • extractTextFromPDF(): Extract text (pdf-parse)                │
│  • extractTextFromDOCX(): Extract text (mammoth)                 │
│  • parseDocumentWithClaude(): Call Claude API                    │
│  • parseDocument(): Full pipeline                                │
│                                                                    │
└────────┬──────────────────────────────┬──────────────────────────┘
         │                              │
         ├──────────────┬───────────────┤
         │              │               │
┌────────▼────┐  ┌──────▼──────┐  ┌────▼──────┐
│  AI Prompts │  │  Database   │  │  Claude   │
│  ─────────  │  │  (Prisma)   │  │  API      │
│ • FICHA     │  │  ────────   │  │  ───────  │
│ • ESTUDIO   │  │ • Document  │  │ • Parse   │
│ • GUIA      │  │ • Project   │  │   docs    │
│ • CASO      │  │ • Config    │  │ • Token   │
│ • CONTEXTO  │  │ • Cases     │  │   usage   │
│ • COMPETENCIA│  │             │  │           │
└────────┬────┘  └──────┬──────┘  └────┬──────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
┌───────────────────────▼────────────────────────────────────┐
│                  DATA PERSISTENCE LAYER                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Prisma ORM + PostgreSQL                                  │
│  ─────────────────────────                                │
│                                                             │
│  Document Model:                                           │
│  ├─ id: String (UUID, PK)                                 │
│  ├─ projectId: String (FK → Project)                      │
│  ├─ title: String                                         │
│  ├─ type: DocumentType enum                               │
│  ├─ filename: String                                      │
│  ├─ fileSize: Int                                         │
│  ├─ mimeType: String                                      │
│  ├─ parsingStatus: ParsingStatus enum                     │
│  ├─ version: String                                       │
│  ├─ metadata: Json                                        │
│  ├─ parsedData: Json (extracted by Claude)                │
│  ├─ errorMessage: String                                  │
│  ├─ createdAt: DateTime                                   │
│  ├─ updatedAt: DateTime                                   │
│  └─ indexes: (projectId, type), (projectId, status)       │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## 🔄 Request/Response Flow

### Document Upload Flow
```
User selects file & submits form
       │
       ▼
DocumentUpload Component validates locally
       │
       ▼
POST /api/projects/:id/documents (FormData)
       │
       ├─ Parse form data
       ├─ Validate against uploadDocumentSchema
       ├─ Check file size, type, extension
       ├─ Validate magic bytes (PDF/DOCX signatures)
       ├─ Sanitize filename
       └─ Create Document record
       │
       ▼
Return 201 + document data
       │
       ▼
DocumentList refreshes with new document
       │
       ▼
User sees document card with PENDING status
```

### Document Parsing Flow
```
User clicks "Parse" button on document card
       │
       ▼
POST /api/projects/:id/documents/:docId/parse
       │
       ├─ Verify document exists
       └─ Update status → PROCESSING
       │
       ▼
Return 202 Accepted
       │
       ▼
[In production: Queue for background job]
[For now: Synchronous processing]
       │
       ├─ extractTextFromFile()
       │   ├─ If PDF: pdf-parse (extract text)
       │   ├─ If DOCX: mammoth (extract text)
       │   └─ Return full text
       │
       ├─ parseDocumentWithClaude()
       │   ├─ Get appropriate prompt based on document type
       │   ├─ Call Claude API with extracted text
       │   ├─ Parse JSON from response
       │   └─ Extract token usage
       │
       ├─ Update Document record
       │   ├─ parsedData: extracted JSON
       │   ├─ status: COMPLETED or FAILED
       │   └─ errorMessage: if FAILED
       │
       ▼
[Webhook or polling]
       │
       ▼
DocumentDetail page displays parsed data
```

## 📊 Component Dependencies

```
Pages
├─ DocumentsPage
│  ├─ DocumentUpload (component)
│  │  └─ Input, Button, AlertBox (UI)
│  └─ DocumentList (component)
│     ├─ DocumentCard (component)
│     │  ├─ Card, Badge, Button (UI)
│     │  └─ AlertBox
│     └─ LoadingSpinner, AlertBox (UI)
│
└─ DocumentDetailPage
   ├─ Card, Badge, Button (UI)
   ├─ AlertBox
   └─ LoadingSpinner
```

## 🔌 External Dependencies

```
├─ @anthropic-ai/sdk (Claude API)
├─ @prisma/client (Database ORM)
├─ zod (Validation schemas)
│
└─ [To be integrated]:
   ├─ pdf-parse (PDF text extraction)
   └─ mammoth (DOCX text extraction)
```

## 📈 Performance Considerations

| Operation | Time | Notes |
|-----------|------|-------|
| File upload validation | < 100ms | Local validation |
| Database insert | < 50ms | Single record |
| Document list query | < 100ms | With pagination |
| Claude parsing (avg) | 30-120s | Depends on doc size |
| Token usage tracking | real-time | In response metadata |

## 🔐 Security Measures

| Layer | Security |
|-------|----------|
| File Upload | Type validation, size limits, magic byte checking |
| Filename | Sanitization (no path separators, dangerous chars) |
| Input | Zod schema validation |
| API | Project ownership verification |
| Database | Relational integrity (FK constraints) |
| AI | API key from env, not exposed to client |

---

**Architecture designed for easy extension to FASE 3 (Case Generation) and FASE 4 (Validation)**
