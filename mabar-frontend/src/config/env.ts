interface EnvConfig {
  BACK4APP_APP_ID: string
  BACK4APP_JAVASCRIPT_KEY: string
}

function validateEnv(): EnvConfig {
  const appId = import.meta.env.VITE_BACK4APP_APP_ID
  const jsKey = import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY

  console.log('🔍 Environment check:', {
    appId: appId ? `${appId.substring(0, 8)}...` : 'missing',
    jsKey: jsKey ? `${jsKey.substring(0, 8)}...` : 'missing',
    allEnvVars: Object.keys(import.meta.env),
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

  return {
    BACK4APP_APP_ID: appId,
    BACK4APP_JAVASCRIPT_KEY: jsKey,
  }
}

export const env = validateEnv()
