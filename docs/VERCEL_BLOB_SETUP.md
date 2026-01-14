# Vercel Blob Storage Setup

## Overview

STAR Workforce Solutions uses Vercel Blob for storing user-uploaded resumes.

---

## Setup Steps

### 1. Enable Vercel Blob

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → Select **Blob**
4. Name it: `star-workforce-resumes`
5. Click **Create**

### 2. Environment Variables

Vercel automatically adds these environment variables:

\`\`\`bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
\`\`\`

No additional configuration needed - the `@vercel/blob` package uses this automatically.

---

## Usage

### Upload Resume

\`\`\`typescript
import { put } from '@vercel/blob';

const blob = await put(filename, file, {
  access: 'public',
  addRandomSuffix: true,
});

console.log(blob.url); // https://...blob.vercel-storage.com/...
\`\`\`

### File Constraints

- **Max file size**: 5MB
- **Allowed types**: PDF, DOC, DOCX
- **Storage path**: `/resumes/{userId}/{timestamp}-{filename}`
- **Access**: Public (URLs are publicly accessible but hard to guess)

### Security

- Files are stored with random suffixes making URLs unguessable
- Only authenticated users can upload
- User ID is embedded in the file path
- Database tracks all uploads with user association

---

## API Routes

### POST /api/upload/resume

Uploads a resume file.

**Request:**
\`\`\`
POST /api/upload/resume
Content-Type: multipart/form-data

file: <File>
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "url": "https://...blob.vercel-storage.com/...",
  "resumeId": "uuid"
}
\`\`\`

**Errors:**
- 400: Invalid file type or size
- 401: Unauthorized
- 500: Upload failed

---

## React Component

The `ResumeUpload` component provides a complete upload UI:

\`\`\`tsx
import ResumeUpload from '@/components/resume-upload';

<ResumeUpload
  onUploadComplete={(url, resumeId) => {
    console.log('Resume uploaded:', url);
  }}
/>
\`\`\`

**Features:**
- Drag and drop support
- File type and size validation
- Progress indicator
- Success/error states
- File preview with size display

---

## Database Integration

All uploads are tracked in the `resumes` table:

\`\`\`sql
SELECT * FROM resumes WHERE "userId" = 'user-id' ORDER BY "createdAt" DESC;
\`\`\`

This provides:
- Audit trail of all uploads
- User association
- Upload timestamps
- Direct Blob URLs

---

## Cost Considerations

Vercel Blob pricing:
- **Free tier**: 1GB storage, 100GB bandwidth
- **Pro**: $0.15/GB/month storage, $0.20/GB bandwidth

For production:
- Estimate: 1000 resumes × 500KB = 500MB = ~$0.08/month
- Bandwidth: 10,000 views × 500KB = 5GB = ~$1/month

Very affordable for this use case.

---

## Troubleshooting

**"Failed to upload resume"**
- Check that `BLOB_READ_WRITE_TOKEN` is set
- Verify Vercel Blob is enabled in dashboard
- Check file size < 5MB
- Check file type is PDF/DOC/DOCX

**"Unauthorized" error**
- Ensure user is authenticated
- Check NextAuth session is valid
- Verify API route has `requireAuth()` call

**Files not appearing**
- Check Vercel Blob dashboard for uploaded files
- Verify database record was created
- Check console for error logs

**Slow uploads**
- Files > 2MB may take 5-10 seconds
- Consider adding progress bar for large files
- Compress PDFs before upload if possible

---

## Production Checklist

- [ ] Vercel Blob enabled in dashboard
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable set
- [ ] Test upload with PDF file
- [ ] Test upload with DOCX file
- [ ] Verify file size limit (5MB)
- [ ] Verify file type validation
- [ ] Check database records created
- [ ] Test unauthorized access blocked
- [ ] Monitor storage usage in Vercel dashboard
\`\`\`
\`\`\`
