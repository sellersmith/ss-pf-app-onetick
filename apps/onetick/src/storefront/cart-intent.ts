// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
export const ONETICK_CART_INTENT = {
  appId: 'onetick',
  conflictGroup: 'cart-addon-line-items',
  ownedPropertyPrefix: '__onetick_',
  masterPropertyKey: '__onetick_properties',
  supportedSurfaces: ['cart-page', 'cart-drawer', 'pdp-add-to-cart', 'pdp-pre-checkout'],
  failOpenBehavior: 'no-op',
  preCheckout: {
    latencyBudgetMs: 50,
    failOpen: true,
    fallbackBehavior: 'no-op',
  },
  checkoutBypass: {
    behavior: 'fail-open-no-op',
    surfaces: ['buy-it-now', 'shop-pay', 'dynamic-checkout', 'pdp-add-and-go-to-checkout'],
    reason: 'OneTick V0.1 does not mutate accelerated checkout submissions before Shopify owns checkout.',
  },
} as const

// Private line properties mark OneTick-owned add-ons so cleanup can remove only lines it owns.
export const ONETICK_ORDER_PROPERTY_KEYS = {
  properties: '__onetick_properties',
  widgetType: '__onetick_widget_type',
  widgetId: '__onetick_widget_id',
  widgetPlacement: '__onetick_widget_placement',
  masterProductId: '__onetick_master_product_id',
  variantProductId: '__onetick_variant_product_id',
  masterVariantId: '__onetick_master_variant_id',
  checkboxData: '__onetick_checkbox_data',
  canRemoveWhenTriggerRemove: '__onetick_checkbox_can_remove_when_trigger_remove',
  triggerProductTitle: '__trigger_product',
  triggerVariantTitle: '__trigger_variant',
} as const

export interface OneTickCartAddonIntent {
  widgetId: string
  addonVariantId: string
  triggerVariantId: string
  triggerProductId?: string
  triggerProductTitle?: string
  canRemoveWhenTriggerRemoved: boolean
  placement: 'product-details' | 'cart'
}

export interface OneTickProductOfferIntent {
  offerId: string
  placement: 'cart' | 'product_page'
  masterProductTitle?: string
  masterVariantTitle?: string
}

export function createOneTickOrderProperties(intent: OneTickCartAddonIntent): Record<string, string> {
  const value = [
    'checkbox',
    intent.widgetId,
    intent.placement,
    String(intent.canRemoveWhenTriggerRemoved),
    intent.addonVariantId,
    intent.triggerVariantId,
    intent.triggerProductId || '',
    '',
  ].join(';')

  return {
    [ONETICK_ORDER_PROPERTY_KEYS.properties]: value,
    ...(intent.triggerProductTitle && intent.placement !== 'cart'
      ? { [ONETICK_ORDER_PROPERTY_KEYS.triggerProductTitle]: intent.triggerProductTitle }
    : {}),
  }
}

export function createOneTickProductOfferProperties(intent: OneTickProductOfferIntent): Record<string, string> {
  const value = ['product-offer', intent.offerId, intent.placement, 'false', '', '', '', ''].join(';')
  const triggerProductTitle = formatTriggerProductTitle(intent.masterProductTitle, intent.masterVariantTitle)

  return {
    [ONETICK_ORDER_PROPERTY_KEYS.properties]: value,
    ...(triggerProductTitle && intent.placement !== 'cart'
      ? { [ONETICK_ORDER_PROPERTY_KEYS.triggerProductTitle]: triggerProductTitle }
      : {}),
  }
}

function formatTriggerProductTitle(productTitle?: string, variantTitle?: string): string {
  if (!productTitle) return ''
  return variantTitle ? `${productTitle}: ${variantTitle}` : productTitle
}
