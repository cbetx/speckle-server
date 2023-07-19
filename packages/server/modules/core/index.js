const { registerOrUpdateScope, registerOrUpdateRole } = require('@/modules/shared')
const { moduleLogger } = require('@/logging/logging')
const {
  setupResultListener,
  shutdownResultListener
} = require('@/modules/core/utils/dbNotificationListener')
const mp = require('@/modules/shared/utils/mixpanel')

exports.init = async (app) => {
  moduleLogger.info('💥 Init core module')
  // Initialize the static route
  require('./rest/static')(app)

  // Initialises the two main bulk upload/download endpoints
  require('./rest/upload')(app)
  require('./rest/download')(app)

  // Initialises the two diff-based upload/download endpoints
  require('./rest/diffUpload')(app)
  require('./rest/diffDownload')(app)

  // E2E test utility endpoints (only in dev / test mode)
  require('./rest/e2e')(app)

  // Register core-based scoeps
  const scopes = require('./scopes.js')
  for (const scope of scopes) {
    await registerOrUpdateScope(scope)
  }

  // Register core-based roles
  const roles = require('./roles.js')
  for (const role of roles) {
    await registerOrUpdateRole(role)
  }

  // Setup global pg notification listener
  setupResultListener()

  // Init mp
  mp.initialize()
}

exports.finalize = () => {}

exports.shutdown = () => {
  shutdownResultListener()
}
