// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
export type OneTickUnknownRecord = Record<string, any>

export interface OneTickCheckboxStyling {
  checkboxType?: string
  tickIcon?: string
  defaultBackground?: string
  activeBackground?: string
  defaultBorder?: string
  activeBorder?: string
  checkboxItem?: {
    defaultBackground?: string
    defaultBorder?: string
  }
  imageSize?: number
}

export interface OneTickRuntimeConfig {
  metafieldsCheckboxData?: OneTickUnknownRecord
  metafieldsStylingProductOffers?: OneTickUnknownRecord
  storefrontAccessToken?: string
  productOffers?: OneTickUnknownRecord
  conditions?: OneTickUnknownRecord
  productsCount?: number
  moneyFormat?: string
  isCartPage?: boolean
  cart?: OneTickUnknownRecord
  listCartProduct?: OneTickUnknownRecord[]
  listCartProductCollections?: OneTickUnknownRecord[][]
  customSelector?: { css?: string; js?: string; csl?: string }
  product?: unknown
  checkboxStyling?: OneTickCheckboxStyling
}

export interface OneTickPubSub {
  subscribe(eventName: string, callback: (data?: unknown) => void): () => void
  publish(eventName: string, data?: unknown): void
}

export interface OneTickStore {
  [key: string]: any
  pubsub?: OneTickPubSub
  appProxyPath?: string
  addonVariants?: Record<string, any>
  triggerProducts?: unknown
  cachedProcessBarHTML?: string
  enableAnalytics?: boolean
  sortOption?: { so: string; co: string }
  sortOptionCart?: { cso: string; cco: string; cs: string }
  money_format?: string
  storefront?: string
  draftCheckboxes: OneTickUnknownRecord[]
  activeCheckboxes: OneTickUnknownRecord[]
  activeCheckboxesProductDetail: OneTickUnknownRecord[]
  activeCheckboxesCart: OneTickUnknownRecord[]
  productsCount?: number
  productOffers: OneTickUnknownRecord
  conditions: OneTickUnknownRecord
  productOffersStyling: OneTickUnknownRecord
  isCartPage: boolean
  custom_selector: string
  mainProduct?: unknown
  cartOrder?: OneTickUnknownRecord
  handleUpdateCartAfterATC?: (addedItem: unknown, cart: unknown) => unknown
}

export interface OneTickSelectedAddonItem {
  checkboxId: string
  id: string
  quantity: number
  properties: Record<string, string>
}

declare global {
  interface Window {
    __onetick_store__?: Partial<OneTickStore>
  }
}
