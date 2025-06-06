import { getVlmRunClient, getCachedPrediction, setCachedPrediction } from '~/server/utils/vlmrun-client'

// Utility to limit concurrent requests
function pLimit(concurrency: number) {
  const queue: Array<() => Promise<any>> = []
  let running = 0

  const next = async () => {
    if (queue.length === 0 || running >= concurrency) return
    
    running++
    const task = queue.shift()!
    try {
      await task()
    } finally {
      running--
      next()
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      queue.push(async () => {
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
      next()
    })
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const ids = body.ids
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Array of prediction IDs is required'
    })
  }

  const config = useRuntimeConfig()
  
  if (!config.vlmrunApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'VLM Run API key not configured'
    })
  }

  const vlmrun = getVlmRunClient(config.vlmrunApiKey)
  
  // Check for batch cache first
  const batchKey = ids.sort().join(',')
  const cachedBatch = getCachedPrediction(`batch:${batchKey}`)
  if (cachedBatch) {
    return cachedBatch
  }

  try {
    // Limit concurrent requests to 3 to avoid overwhelming the API
    const limit = pLimit(3)
    
    const predictions = await Promise.allSettled(
      ids.map((id: string) => 
        limit(async () => {
          // Check individual cache first
          const cached = getCachedPrediction(id)
          if (cached) {
            return { id, data: cached, error: null }
          }

          try {
            const prediction = await vlmrun.predictions.get(id)
            // Cache individual prediction
            setCachedPrediction(id, prediction)
            return { id, data: prediction, error: null }
          } catch (error) {
            return { 
              id, 
              data: null, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }
          }
        })
      )
    )
    
    const results = predictions.map(result => 
      result.status === 'fulfilled' ? result.value : { id: 'unknown', data: null, error: 'Request failed' }
    )
    
    // Cache the batch result
    setCachedPrediction(`batch:${batchKey}`, results)
    
    return results
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch predictions: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})