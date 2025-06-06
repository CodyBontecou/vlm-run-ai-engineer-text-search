import { getVlmRunClient, getCachedPrediction, setCachedPrediction } from '~/server/utils/vlmrun-client'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prediction ID is required'
    })
  }

  // Check cache first
  const cached = getCachedPrediction(id)
  if (cached) {
    return cached
  }

  const config = useRuntimeConfig()
  
  if (!config.vlmrunApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'VLM Run API key not configured'
    })
  }

  const vlmrun = getVlmRunClient(config.vlmrunApiKey)

  try {
    const prediction = await vlmrun.predictions.get(id)
    
    // Cache the result
    setCachedPrediction(id, prediction)
    
    return prediction
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch prediction: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})