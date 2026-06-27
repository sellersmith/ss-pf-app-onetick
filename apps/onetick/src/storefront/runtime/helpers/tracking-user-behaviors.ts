import { BehaviorTracker } from '../modules/behavior-tracker'
import { getOneTickAppProxyPath } from '../utils/app-proxy-path'

const ENABLED_FEATURE_TRACKING_USER_BEHAVIORS = true

export const trackingUserBehaviors = async () => {
  if (!ENABLED_FEATURE_TRACKING_USER_BEHAVIORS) return

  const behaviorTracker = new BehaviorTracker(window.sessionStorage, {
    shopDomain: window.Shopify.shop || '',
    proxyPath: getOneTickAppProxyPath(),
  })

  const onVisibilitychange = async () => {
    if (document.hidden) {
      await behaviorTracker.syncBehaviors()
    }
  }

  // Add new event listener
  document.addEventListener('visibilitychange', onVisibilitychange)

  // Remove event before unload
  window.addEventListener('beforeunload', () => document.removeEventListener('visibilitychange', onVisibilitychange))
}
