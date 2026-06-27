// OneTick domain models are app-owned persisted shapes plus explicit storefront compatibility formatters.
export type OneTickTriggerProductsType =
  | 'all-products'
  | 'product-collections'
  | 'product-tags'
  | 'product-vendors'
  | 'product-types'
  | 'specific-products'
  | 'specific-variants'

export type OneTickPlacementType = 'cart' | 'product_details' | 'product_page'
export type OneTickContentType = 'heading_only' | 'description_only' | 'heading_and_description'

export interface OneTickUpsellProduct {
  productId: string
  variantId: string
}

export interface OneTickCheckboxContent {
  contentType: OneTickContentType
  heading: string
  description: string
  imageUrl: string
  showPrice: boolean
  showComparedPrice: boolean
  preCheck: boolean
  showVariantSelector: boolean
  showFeaturedImage: boolean
  showQuantitySelector: boolean
  showPersonalizeButton: boolean
}

export interface OneTickPopup {
  showPopup: boolean
  heading: string
  description: string
}

export interface OneTickPublishState {
  status: 'pending' | 'published' | 'failed'
  error?: string
  updatedAt: string | null
}

export interface OneTickCheckbox {
  id: string
  title: string
  isActive: boolean
  checkboxContent: OneTickCheckboxContent
  targetProducts: string[]
  triggerProductsType: OneTickTriggerProductsType | null
  upsellProducts: OneTickUpsellProduct[]
  excludeUpsellProducts: boolean
  excludeTriggerProductsType: OneTickTriggerProductsType | null
  excludeTriggerProducts: string[]
  sortOrder: number
  typePlacement: OneTickPlacementType
  hideCartDrawer: boolean
  canRemoveWhenTriggersCleared: boolean
  popup: OneTickPopup
  publishState: OneTickPublishState
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export type OneTickCheckboxInput = Partial<
  Omit<OneTickCheckbox, 'createdAt' | 'updatedAt' | 'deletedAt' | 'checkboxContent' | 'popup' | 'publishState'>
> & {
  checkboxContent?: Partial<OneTickCheckboxContent>
  popup?: Partial<OneTickPopup>
}

const PRODUCT_PREFIX = 'gid://shopify/Product/'
const VARIANT_PREFIX = 'gid://shopify/ProductVariant/'
const ARRAY_SEPARATOR = ','

function stripIdPrefix(value: string, prefix: string): string {
  return value.includes(prefix) ? value.split(prefix)[1] : value
}

function textContainer(value: string): string {
  return `<onetick-text-container>${value}</onetick-text-container>`
}

function compactTimestamp(value: string): string {
  return value.replace(/\D/g, '').slice(0, 17)
}

/** Creates the persisted app-data shape; publishState is owned by the backend publisher. */
export function createOneTickCheckbox(input: OneTickCheckboxInput = {}): OneTickCheckbox {
  const now = new Date().toISOString()
  return {
    id: input.id || `checkbox-${Date.now()}`,
    title: input.title || 'Untitled checkbox',
    isActive: input.isActive ?? false,
    checkboxContent: {
      contentType: input.checkboxContent?.contentType || 'heading_only',
      heading: input.checkboxContent?.heading || '',
      description: input.checkboxContent?.description || '',
      imageUrl: input.checkboxContent?.imageUrl || '',
      showPrice: input.checkboxContent?.showPrice ?? false,
      showComparedPrice: input.checkboxContent?.showComparedPrice ?? false,
      preCheck: input.checkboxContent?.preCheck ?? false,
      showVariantSelector: input.checkboxContent?.showVariantSelector ?? false,
      showFeaturedImage: input.checkboxContent?.showFeaturedImage ?? false,
      showQuantitySelector: input.checkboxContent?.showQuantitySelector ?? false,
      showPersonalizeButton: input.checkboxContent?.showPersonalizeButton ?? false,
    },
    targetProducts: input.targetProducts || [],
    triggerProductsType: input.triggerProductsType ?? 'all-products',
    upsellProducts: input.upsellProducts || [],
    excludeUpsellProducts: input.excludeUpsellProducts ?? false,
    excludeTriggerProductsType: input.excludeTriggerProductsType ?? null,
    excludeTriggerProducts: input.excludeTriggerProducts || [],
    sortOrder: input.sortOrder ?? 0,
    typePlacement: input.typePlacement || 'product_details',
    hideCartDrawer: input.hideCartDrawer ?? false,
    canRemoveWhenTriggersCleared: input.canRemoveWhenTriggersCleared ?? false,
    popup: {
      showPopup: input.popup?.showPopup ?? false,
      heading: input.popup?.heading || 'This is your popup heading.',
      description: input.popup?.description || 'This is your popup description.',
    },
    publishState: {
      status: 'pending',
      updatedAt: null,
    },
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

export function updateOneTickCheckbox(current: OneTickCheckbox, input: OneTickCheckboxInput): OneTickCheckbox {
  return {
    ...current,
    ...input,
    checkboxContent: {
      ...current.checkboxContent,
      ...(input.checkboxContent || {}),
    },
    popup: {
      ...current.popup,
      ...(input.popup || {}),
    },
    publishState: current.publishState,
    id: current.id,
    deletedAt: current.deletedAt,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Converts the repository record into TailorKit-compatible compact metafield payload.
 *
 * Storefront runtime still reads these short keys, so this function is the compatibility boundary
 * instead of copying TailorKit models/services into PageFly.
 */
export function formatOneTickCheckboxForMetafield(checkbox: OneTickCheckbox) {
  if (!checkbox.isActive) {
    return {
      id: checkbox.id,
      isDraft: true,
      t: checkbox.title,
      tp: checkbox.targetProducts,
      tpt: checkbox.triggerProductsType,
      up: checkbox.upsellProducts.map(p => stripIdPrefix(p.productId, PRODUCT_PREFIX)).join(ARRAY_SEPARATOR),
      tpl: checkbox.typePlacement,
      exc: checkbox.excludeUpsellProducts,
    }
  }

  return {
    id: checkbox.id,
    tp: checkbox.targetProducts.map(p => stripIdPrefix(p, PRODUCT_PREFIX)).join(ARRAY_SEPARATOR),
    tpt: checkbox.triggerProductsType,
    ctp: checkbox.checkboxContent.contentType,
    ca: compactTimestamp(checkbox.createdAt),
    up: checkbox.upsellProducts.map(p => stripIdPrefix(p.productId, PRODUCT_PREFIX)).join(ARRAY_SEPARATOR),
    uv: checkbox.upsellProducts.map(p => stripIdPrefix(p.variantId, VARIANT_PREFIX)).join(ARRAY_SEPARATOR),
    exc: checkbox.excludeUpsellProducts,
    h: textContainer(checkbox.checkboxContent.heading),
    d: textContainer(checkbox.checkboxContent.description),
    img: checkbox.checkboxContent.imageUrl,
    pc: checkbox.checkboxContent.preCheck,
    svs: checkbox.checkboxContent.showVariantSelector,
    sp: checkbox.checkboxContent.showPrice,
    scp: checkbox.checkboxContent.showComparedPrice,
    spu: checkbox.popup.showPopup,
    ph: checkbox.popup.heading,
    pd: textContainer(checkbox.popup.description),
    tpl: checkbox.typePlacement,
    hcd: checkbox.hideCartDrawer,
    rwtc: checkbox.canRemoveWhenTriggersCleared,
    sfi: checkbox.checkboxContent.showFeaturedImage,
    spb: checkbox.checkboxContent.showPersonalizeButton,
    ett: checkbox.excludeTriggerProductsType,
    etp: checkbox.excludeTriggerProducts.map(p => stripIdPrefix(p, PRODUCT_PREFIX)),
  }
}
