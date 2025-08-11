import axios from 'axios'
import { GeometryData } from '@/types/geometry'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function fetchGeometry(modelName: string): Promise<GeometryData> {
  try {
    const response = await axios.get<GeometryData>(`${BASE_URL}/model/`, {
      params: { model_name: modelName },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.detail || error.message || 'Unknown error')
  }
}