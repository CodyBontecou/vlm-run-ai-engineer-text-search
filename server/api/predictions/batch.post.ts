import { VlmRun } from 'vlmrun'

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

  const vlmrun = new VlmRun({
    apiKey: config.vlmrunApiKey
  })

  try {
    const predictions = await Promise.all(
      ids.map(async (id) => {
        try {
          const prediction = await vlmrun.predictions.get(id)
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
    
    return predictions
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch predictions: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})