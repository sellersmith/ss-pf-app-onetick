// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { ONETICK_CART_INTENT } from './cart-intent'
import { ONETICK_STOREFRONT_LIQUID_CONFIG } from './liquid-config'
import { ONETICK_CONFIG_ELEMENT_ID, ONETICK_STORE_GLOBAL } from './runtime-constants'

export { ONETICK_CONFIG_ELEMENT_ID, ONETICK_STORE_GLOBAL }

/** Liquid/app-data snapshot fields consumed by the browser runtime. Primary app data stays in Mongo. */
export interface OneTickStorefrontConfigSource {
  metafieldsCheckboxData?: Record<string, unknown>
  metafieldsStylingProductOffers?: Record<string, unknown>
  storefrontAccessToken?: string
  productOffers?: Record<string, unknown>
  conditions?: Record<string, unknown>
  moneyFormat?: string
  isCartPage?: boolean
  customSelector?: { css?: string; js?: string; csl?: string }
  product?: unknown
  checkboxStyling?: Record<string, unknown>
}

// Build scripts and publish flows discover this contribution by shape. Keep it app-owned and avoid
// adding PageFly helper paths here except for the generated CDN asset path.
export const onetickStorefrontContribution = {
  name: 'onetick-storefront-runtime',
  assetPath: 'app-platform/apps/onetick/storefront/onetick.js',
  configElementId: ONETICK_CONFIG_ELEMENT_ID,
  globalStoreKey: ONETICK_STORE_GLOBAL,
  liquidConfigTemplate: ONETICK_STOREFRONT_LIQUID_CONFIG,
  runtimeInstaller: {
    module: '@pagefly-apps/onetick/src/storefront/runtime-installer',
    exportName: 'installOneTickStorefrontRuntime',
  },
  cartIntent: ONETICK_CART_INTENT,
  sourceConfig: {
    liquidConfigScriptId: ONETICK_CONFIG_ELEMENT_ID,
    appMetafields: [
      'onetick_checkbox',
      'onetick_styling_product_offers',
      'onetick_product_offers',
      'onetick_condition',
      'onetick_custom_selector.custom_selector',
      'onetick_storefront.storefront_access_token',
      'onetick_global_styling.checkbox',
    ],
  },
} as const
