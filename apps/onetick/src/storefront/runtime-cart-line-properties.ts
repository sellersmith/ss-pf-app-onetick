// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { ONETICK_ORDER_PROPERTY_KEYS } from './cart-intent'

const PRODUCT_DETAIL_PLACEMENTS = new Set(['product-details', 'product_details'])
const CART_PLACEMENT = 'cart'

export interface OneTickCartLineItem {
  id?: string | number
  key?: string
  product_id?: string | number
  productType?: string
  product_type?: string
  tags?: Array<string | number>
  collections?: Array<string | number>
  vendor?: string
  variant_id?: string | number
  properties?: Record<string, unknown>
}

interface ParsedOneTickProperties {
  placement: string
  canRemoveWhenTriggerRemoved: boolean
  masterProductId: string
  masterVariantId: string
  checkboxData: {
    tpt?: string
    tp?: Array<string | number>
  }
}

export function parseOneTickLineProperties(properties?: Record<string, unknown>): ParsedOneTickProperties | null {
  const rawProperties = properties?.[ONETICK_ORDER_PROPERTY_KEYS.properties]
  if (typeof rawProperties !== 'string') return null

  const [, , placement, canRemove, , masterVariantId, masterProductId, ...dataParts] = rawProperties.split(';')
  const data = dataParts.join(';')

  return {
    placement: placement || '',
    canRemoveWhenTriggerRemoved: canRemove === 'true',
    masterProductId: masterProductId || '',
    masterVariantId: masterVariantId || '',
    checkboxData: parseCheckboxData(data),
  }
}

// Legacy OneTick encoded the ownership tuple into one private line property. Parse defensively so
// older line items fail open instead of breaking cart change cleanup.
function parseCheckboxData(data: string): ParsedOneTickProperties['checkboxData'] {
  if (!data) return {}

  try {
    const parsed = JSON.parse(data)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(item => String(item))
  if (value === null || value === undefined || value === '') return []
  return [String(value)]
}

function getCartItemFieldValues(item: OneTickCartLineItem, triggerProductType?: string): string[] {
  switch (triggerProductType) {
    case 'product-collections':
      return normalizeStringList(item.collections)
    case 'product-tags':
      return normalizeStringList(item.tags)
    case 'product-vendors':
      return normalizeStringList(item.vendor)
    case 'product-types':
      return normalizeStringList(item.productType || item.product_type)
    case 'specific-products':
      return normalizeStringList([item.id, item.product_id])
    case 'specific-variants':
      return normalizeStringList([item.variant_id, item.id])
    default:
      return []
  }
}

function cartItemMatchesCheckboxTrigger(item: OneTickCartLineItem, parsed: ParsedOneTickProperties): boolean {
  const triggerProductType = parsed.checkboxData.tpt
  const triggerProducts = normalizeStringList(parsed.checkboxData.tp)
  if (triggerProductType === 'all-products') return true
  if (!triggerProductType || !triggerProducts.length) return false

  return getCartItemFieldValues(item, triggerProductType).some(value => triggerProducts.includes(value))
}

export function isProductDetailAddonForRemovedTrigger(
  item: OneTickCartLineItem,
  removedItem: OneTickCartLineItem
): boolean {
  const removedProductId = removedItem.product_id === undefined ? '' : String(removedItem.product_id)
  const removedVariantId = removedItem.variant_id === undefined ? '' : String(removedItem.variant_id)
  if (!removedProductId || !removedVariantId) return false

  const parsed = parseOneTickLineProperties(item.properties)
  if (!item.key || !parsed) return false

  return (
    PRODUCT_DETAIL_PLACEMENTS.has(parsed.placement) &&
    parsed.canRemoveWhenTriggerRemoved &&
    parsed.masterProductId === removedProductId &&
    parsed.masterVariantId === removedVariantId
  )
}

export function isCartPlacementAddonWithoutMatchingTrigger(
  addOn: OneTickCartLineItem,
  cartItems: OneTickCartLineItem[]
): boolean {
  const parsed = parseOneTickLineProperties(addOn.properties)
  if (!addOn.key || !parsed || parsed.placement !== CART_PLACEMENT || !parsed.canRemoveWhenTriggerRemoved) {
    return false
  }

  const cartItemsExcludeAddOn = cartItems.filter(item => item.key !== addOn.key)
  if (!cartItemsExcludeAddOn.length) return true
  if (parsed.checkboxData.tpt === 'all-products') return false

  return !cartItemsExcludeAddOn.some(item => cartItemMatchesCheckboxTrigger(item, parsed))
}
