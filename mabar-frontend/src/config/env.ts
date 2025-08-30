interface EnvConfig {
  BACK4APP_APP_ID: string
  BACK4APP_JAVASCRIPT_KEY: string
}

function validateEnv(): EnvConfig {
  const appId = import.meta.env.VITE_BACK4APP_APP_ID
  const jsKey = import.meta.env.VITE_BACK4APP_JAVASCRIPT_KEY

  if (!appId) throw new Error('VITE_BACK4APP_APP_ID is required')
  if (!jsKey) throw new Error('VITE_BACK4APP_JAVASCRIPT_KEY is required')

  return {
    BACK4APP_APP_ID: appId,
    BACK4APP_JAVASCRIPT_KEY: jsKey
  }
}

export const env = validateEnv()