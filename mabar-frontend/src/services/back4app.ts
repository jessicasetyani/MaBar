import Parse from 'parse'
import { env } from '../config/env'

// Initialize Parse SDK
Parse.initialize(env.BACK4APP_APP_ID, env.BACK4APP_JAVASCRIPT_KEY)
Parse.serverURL = 'https://parseapi.back4app.com'

export default Parse