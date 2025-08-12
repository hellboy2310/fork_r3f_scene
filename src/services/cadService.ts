import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
})

// Types
export interface UploadResponse {
  filename: string
}

export interface HealthResponse {
  status: string
}

// API service class
export class CADService {
  /**
   * Check if the backend is healthy
   */
  static async health(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>('/health')
    return response.data
  }

  /**
   * Upload a CAD file to the backend
   */
  static async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }

  /**
   * Validate if a file is a valid CAD file
   */
  static validateCADFile(file: File): { isValid: boolean; error?: string } {
    const allowedExtensions = ['.step', '.stp']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: 'Only .step and .stp files are allowed'
      }
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 100MB'
      }
    }

    return { isValid: true }
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export default CADService
