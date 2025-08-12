import { useState, useCallback } from 'react'
import { CADService } from '@/services/cadService'

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UseFileUploadReturn {
  uploadStatus: UploadStatus
  error: string
  uploadedFilename: string
  uploadFile: (file: File) => Promise<void>
  resetUpload: () => void
}

export function useFileUpload(onSuccess?: (filename: string) => void): UseFileUploadReturn {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string>('')
  const [uploadedFilename, setUploadedFilename] = useState<string>('')

  const uploadFile = useCallback(async (file: File) => {
    // Validate file first
    const validation = CADService.validateCADFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      setUploadStatus('error')
      return
    }

    setUploadStatus('uploading')
    setError('')

    try {
      const response = await CADService.uploadFile(file)
      
      setUploadStatus('success')
      setUploadedFilename(response.filename)
      onSuccess?.(response.filename)
      
    } catch (error) {
      setUploadStatus('error')
      
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          setError('Upload timeout. Please try again.')
        } else if (error.message.includes('Network Error')) {
          setError('Network error. Please check if the backend server is running.')
        } else {
          setError(error.message || 'Upload failed. Please try again.')
        }
      } else {
        setError('An unexpected error occurred.')
      }
    }
  }, [onSuccess])

  const resetUpload = useCallback(() => {
    setUploadStatus('idle')
    setError('')
    setUploadedFilename('')
  }, [])

  return {
    uploadStatus,
    error,
    uploadedFilename,
    uploadFile,
    resetUpload,
  }
}
