import { VlmRun } from 'vlmrun'

let vlmrunClient: VlmRun | null = null

export function getVlmRunClient(apiKey: string): VlmRun {
  if (!vlmrunClient) {
    vlmrunClient = new VlmRun({
      apiKey,
      // Add connection pooling options if available
      timeout: 30000, // 30 second timeout
    })
  }
  return vlmrunClient
}

// Prediction cache with TTL (15 minutes)
const predictionCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export function getCachedPrediction(id: string): any | null {
  const cached = predictionCache.get(id)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  predictionCache.delete(id)
  return null
}

export function setCachedPrediction(id: string, data: any): void {
  predictionCache.set(id, { data, timestamp: Date.now() })
  
  // Clean up old cache entries periodically
  if (predictionCache.size > 100) {
    const now = Date.now()
    for (const [key, value] of predictionCache.entries()) {
      if (now - value.timestamp >= CACHE_TTL) {
        predictionCache.delete(key)
      }
    }
  }
}