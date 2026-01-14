"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ResumeUploadProps {
  onUploadComplete?: (url: string, resumeId: string) => void
}

export default function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus("idle")
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/resume", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadStatus("success")
      if (onUploadComplete) {
        onUploadComplete(data.url, data.resumeId)
      }
    } catch (err: any) {
      setUploadStatus("error")
      setError(err.message || "Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setUploadStatus("idle")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or DOCX (MAX. 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>

              {uploadStatus === "idle" && (
                <Button size="sm" variant="ghost" onClick={handleClear}>
                  Remove
                </Button>
              )}

              {uploadStatus === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}

              {uploadStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">{error}</div>}

          {uploadStatus === "success" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              Resume uploaded successfully!
            </div>
          )}

          {file && uploadStatus === "idle" && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-[#E8C547] hover:bg-[#d4b540] text-[#0A1A2F]"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Resume"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
