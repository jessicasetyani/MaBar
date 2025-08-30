import Parse from '../services/back4app'
import { env } from '../config/env'

export async function testBack4AppConnection() {
  // Check if credentials are placeholder values
  if (env.BACK4APP_APP_ID === 'your_app_id_here' || env.BACK4APP_JAVASCRIPT_KEY === 'your_javascript_key_here') {
    return { success: false, message: 'Back4App credentials not configured - using placeholder values' }
  }

  try {
    // Test basic Parse server connectivity
    const query = new Parse.Query('_User')
    query.limit(1)
    await query.find()
    return { success: true, message: 'Back4App connection successful' }
  } catch (error) {
    const errorMessage = (error as Error).message
    if (errorMessage.includes('unauthorized')) {
      return { success: false, message: 'Back4App credentials invalid' }
    }
    return { success: false, message: `Connection failed: ${errorMessage}` }
  }
}