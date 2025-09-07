interface EnvConfig {
  BACK4APP_APP_ID: string
  BACK4APP_JAVASCRIPT_KEY: string
  GOOGLE_API_KEY: string
}

function validateEnv(): EnvConfig {
  const appId = import.meta.env.VITE_BACK4APP_APP_ID
  const jsKey = import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY
  const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY

  console.log('🔍 Environment check:', {
    appId: appId ? `${appId.substring(0, 8)}...` : 'missing',
    jsKey: jsKey ? `${jsKey.substring(0, 8)}...` : 'missing',
    googleApiKey: googleApiKey ? `${googleApiKey.substring(0, 8)}...` : 'missing',
    allEnvVars: import.meta.env,
  })

  if (!appId) {
    console.error(
      '❌ VITE_BACK4APP_APP_ID is missing from environment variables'
    )
    throw new Error('VITE_BACK4APP_APP_ID is required')
  }
  if (!jsKey) {
    console.error(
      '❌ VITE_BACK4APP_JAVASCRIPT_KEY is missing from environment variables'
    )
    throw new Error('VITE_BACK4APP_JAVASCRIPT_KEY is required')
  }
  if (!googleApiKey) {
    console.error(
      '❌ VITE_GOOGLE_API_KEY is missing from environment variables'
    )
    console.error('Available env vars:', import.meta.env)
    // Don't throw error, use fallback
    console.warn('Using fallback API key from root .env')
  }

  return {
    BACK4APP_APP_ID: appId,
    BACK4APP_JAVASCRIPT_KEY: jsKey,
    GOOGLE_API_KEY: googleApiKey || 'AIzaSyCuGsfM_9vomcFy4n8vzHD-f_0JWkSuaqg', // Fallback from root .env
  }
}

export const env = validateEnv()
