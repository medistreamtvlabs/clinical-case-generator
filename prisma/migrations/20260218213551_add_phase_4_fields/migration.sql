-- Add FASE 4 fields to ClinicalCase table

-- Validation fields (FASE 4A)
ALTER TABLE "clinical_cases" ADD COLUMN "validationScore" INTEGER;
ALTER TABLE "clinical_cases" ADD COLUMN "lastValidatedAt" TIMESTAMP(3);

-- Approval Workflow fields (FASE 4B)
ALTER TABLE "clinical_cases" ADD COLUMN "submittedForReviewAt" TIMESTAMP(3);
ALTER TABLE "clinical_cases" ADD COLUMN "submittedForReviewBy" TEXT;
ALTER TABLE "clinical_cases" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "clinical_cases" ADD COLUMN "archivedBy" TEXT;

-- Publishing audit field
ALTER TABLE "clinical_cases" ADD COLUMN "publishedBy" TEXT;

-- Add indexes for performance
CREATE INDEX "clinical_cases_submittedForReviewAt_idx" ON "clinical_cases"("submittedForReviewAt");
CREATE INDEX "clinical_cases_validationScore_idx" ON "clinical_cases"("validationScore");
CREATE INDEX "clinical_cases_status_validationScore_idx" ON "clinical_cases"("status", "validationScore");

-- Update CaseComment table
ALTER TABLE "case_comments" ADD COLUMN "isReview" BOOLEAN NOT NULL DEFAULT false;

-- Add index for filtering review comments
CREATE INDEX "case_comments_caseId_isReview_idx" ON "case_comments"("caseId", "isReview");

-- Create ExportHistory table
CREATE TABLE "export_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "exportedBy" TEXT NOT NULL,
    "exportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER,
    "metadata" JSONB,
    CONSTRAINT "export_history_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "clinical_cases" ("id") ON DELETE CASCADE,
    CONSTRAINT "export_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
);

-- Create indexes for ExportHistory
CREATE INDEX "export_history_caseId_idx" ON "export_history"("caseId");
CREATE INDEX "export_history_projectId_idx" ON "export_history"("projectId");
CREATE INDEX "export_history_exportedAt_idx" ON "export_history"("exportedAt");
