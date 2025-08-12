'use client'

import { useState, useRef } from 'react'
import { Upload, FileType, X, CheckCircle, AlertCircle } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CADService } from "@/services/cadService"
import { useFileUpload } from "@/hooks/useFileUpload"

interface ImportDialogProps {
  onFileUploaded?: (filename: string) => void
}

export function ImportDialog({ onFileUploaded }: ImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [fileValidationError, setFileValidationError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadStatus, error, uploadedFilename, uploadFile, resetUpload } = useFileUpload(
    (filename) => {
      onFileUploaded?.(filename)
      // Auto close dialog after successful upload
      setTimeout(() => {
        setOpen(false)
        resetDialog()
      }, 2000)
    }
  )

  const validateFile = (file: File): boolean => {
    const validation = CADService.validateCADFile(file)
    
    if (!validation.isValid) {
      setFileValidationError(validation.error || 'Invalid file')
      return false
    }

    setFileValidationError('')
    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      resetUpload() // Reset upload state when new file is selected
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    
    const file = event.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    await uploadFile(selectedFile)
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setFileValidationError('')
    setDragActive(false)
    resetUpload()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Show validation error or upload error
  const displayError = fileValidationError || error

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start px-2 py-1.5 h-auto text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
          onClick={() => setOpen(true)}
        >
          Import CAD
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-card border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import CAD File
          </DialogTitle>
          <DialogDescription>
            Upload a STEP (.step) or STP (.stp) file to import into your 3D scene.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary bg-primary' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }
              ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
              ${uploadStatus === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".step,.stp"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {uploadStatus === 'success' ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Upload Successful!
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadedFilename}
                </p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="space-y-2">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-red-700 dark:text-red-400 font-medium">
                  Upload Failed
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <FileType className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {selectedFile ? 'File Selected' : 'Choose a file or drag it here'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports .step and .stp files up to 100MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selected File Info */}
          {selectedFile && uploadStatus !== 'success' && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileType className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setFileValidationError('')
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Size: {CADService.formatFileSize(selectedFile.size)}
              </p>
            </div>
          )}

          {/* Error Message */}
          {displayError && uploadStatus !== 'error' && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              {displayError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetDialog()
              }}
              disabled={uploadStatus === 'uploading'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
              className="min-w-[100px]"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
