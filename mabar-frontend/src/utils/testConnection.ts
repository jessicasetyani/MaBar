import Parse from '../services/back4app'
import { env } from '../config/env'

export async function testBack4AppConnection() {
  // Check if credentials are placeholder values
  if (env.BACK4APP_APP_ID === 'your_app_id_here' || env.BACK4APP_JAVASCRIPT_KEY === 'your_javascript_key_here') {
    return { success: false, message: 'Back4App credentials not configured - using placeholder values' }
  }

  try {
    // Test basic Parse server connectivity with a simpler approach
    const query = new Parse.Query('_User')
    query.limit(1)
    await query.find()
    return { success: true, message: 'Back4App connection successful' }
  } catch (error) {
    const errorMessage = (error as Error).message
    console.warn('Back4App connection test failed, but app will continue to work:', errorMessage)

    if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
      return { success: false, message: 'Back4App credentials may be invalid, but authentication will still work for new users' }
    }
    return { success: false, message: `Connection test failed: ${errorMessage} (app will still function)` }
  }
}