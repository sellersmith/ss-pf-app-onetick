// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { ONETICK_CONFIG_ELEMENT_ID } from './runtime-constants'
import type { OneTickRuntimeConfig, OneTickStore, OneTickUnknownRecord } from './runtime-types'

export function parseOneTickConfigText(configText?: string | null): OneTickRuntimeConfig | null {
  if (!configText) return null

  try {
    return JSON.parse(configText) as OneTickRuntimeConfig
  } catch (error) {
    console.error('[OneTick] Unable to parse config JSON', error)
    return null
  }
}

export function readOneTickConfig(documentRef: Document = document): OneTickRuntimeConfig | null {
  return parseOneTickConfigText(documentRef.getElementById(ONETICK_CONFIG_ELEMENT_ID)?.textContent)
}

/** Splits OneTick metafield entries into active/draft lists while preserving fallback styling. */
export function splitOneTickCheckboxes(metafieldsCheckboxData?: OneTickUnknownRecord) {
  const activeCheckboxes: OneTickUnknownRecord[] = []
  const draftCheckboxes: OneTickUnknownRecord[] = []
  const defaultOrderOptions = metafieldsCheckboxData?.default_checkboxes_order_option?.value || {}
  const globalStyling = metafieldsCheckboxData?.global_styling?.value

  Object.entries(metafieldsCheckboxData || {}).forEach(([key, value]) => {
    if (['global_styling', 'default_checkboxes_order_option', 'enable_analytics'].includes(key)) return

    const checkboxData = value?.value ?? value
    if (!checkboxData) return

    if (checkboxData.isDraft === null || checkboxData.isDraft === undefined) {
      activeCheckboxes.push(checkboxData)
    } else {
      draftCheckboxes.push(checkboxData)
    }
  })

  return {
    activeCheckboxes,
    draftCheckboxes,
    defaultOrderOptions,
    globalStyling,
    fallbackStyleSource: globalStyling ? null : activeCheckboxes[0] || draftCheckboxes[0],
  }
}

export function buildOneTickCartOrder(config: OneTickRuntimeConfig): OneTickUnknownRecord | null {
  if (!config.cart) return null

  const cartOrder = { ...config.cart }
  if (Array.isArray(cartOrder.items)) {
    cartOrder.items = cartOrder.items.map((item: OneTickUnknownRecord, index: number) => ({
      ...item,
      product: {
        ...(config.listCartProduct?.[index] || {}),
        collections: config.listCartProductCollections?.[index] || [],
      },
    }))
  }

  return cartOrder
}

/** Normalizes the Liquid snapshot into window.__onetick_store__ without reaching back to backend APIs. */
export function buildOneTickStoreState(config: OneTickRuntimeConfig | null): Partial<OneTickStore> {
  if (!config) {
    return {
      activeCheckboxes: [],
      draftCheckboxes: [],
      activeCheckboxesProductDetail: [],
      activeCheckboxesCart: [],
      productOffers: {},
      conditions: {},
      productOffersStyling: {},
      isCartPage: false,
      custom_selector: '',
    }
  }

  const { activeCheckboxes, draftCheckboxes, defaultOrderOptions } = splitOneTickCheckboxes(
    config.metafieldsCheckboxData
  )
  const cartOrder = buildOneTickCartOrder(config)

  return {
    enableAnalytics: config.metafieldsCheckboxData?.enable_analytics?.value ?? false,
    sortOption: { so: defaultOrderOptions.so || 'LAST_CREATED_ASC', co: defaultOrderOptions.co ?? '' },
    sortOptionCart: {
      cso: defaultOrderOptions.cso || 'LAST_CREATED_ASC',
      cco: defaultOrderOptions.cco ?? '',
      cs: defaultOrderOptions.cs ?? '',
    },
    money_format: config.moneyFormat,
    storefront: config.storefrontAccessToken,
    draftCheckboxes,
    activeCheckboxes,
    activeCheckboxesProductDetail: activeCheckboxes.filter(item => item.tpl !== 'cart'),
    activeCheckboxesCart: activeCheckboxes.filter(item => item.tpl === 'cart'),
    productsCount: config.productsCount,
    productOffers: config.productOffers || {},
    conditions: config.conditions || {},
    productOffersStyling: config.metafieldsStylingProductOffers || {},
    isCartPage: Boolean(config.isCartPage),
    custom_selector: config.customSelector?.csl || '',
    mainProduct: config.product,
    ...(cartOrder ? { cartOrder } : {}),
  }
}
