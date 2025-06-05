import { VlmRun } from 'vlmrun'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prediction ID is required'
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
    const prediction = await vlmrun.predictions.get(id)
    return prediction
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch prediction: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})