import Parse from 'parse'
import { env } from '../../mabar-frontend/src/config/env'

// Initialize Parse SDK
Parse.initialize(env.BACK4APP_APP_ID, env.BACK4APP_JAVASCRIPT_KEY)
Parse.serverURL = 'https://parseapi.back4app.com'

export default Parse