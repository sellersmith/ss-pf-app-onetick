import { EPubSubEvents } from '../constants'
import { publish } from '../utils/pubsub'

export const applySelectedVariantProxy = () => {
  if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && typeof window.ShopifyAnalytics.meta === 'object') {
    const handler = {
      set(target, prop, value) {
        if (prop === 'selectedVariantId') {
          publish(EPubSubEvents.SELECTED_VARIANT_CHANGE, { selectedVariantId: value })
        }
        target[prop] = value
        return true
      },
      get(target, prop) {
        return target[prop]
      },
    }

    window.ShopifyAnalytics.meta = new Proxy(window.ShopifyAnalytics.meta, handler)
  }
}
