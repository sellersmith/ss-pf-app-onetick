import { ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID } from '../../runtime-style-defaults'
import { appendOneTickStaticCss } from '../../runtime-static-css'
import { createOneTickCheckboxStyleText } from '../../runtime-styles'

export type CheckboxStyling = {
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

export type OnetickConfig = {
  metafieldsCheckboxData?: Record<string, any>
  metafieldsStylingProductOffers?: Record<string, any>
  storefrontAccessToken?: string
  productOffers?: Record<string, any>
  conditions?: Record<string, any>
  productsCount?: number
  moneyFormat?: string
  isCartPage?: boolean
  cart?: any
  listCartProduct?: any[]
  listCartProductCollections?: any[]
  customSelector?: { css?: string; js?: string; csl?: string }
  product?: any
  checkboxStyling?: CheckboxStyling
}

export type DefaultCheckboxOrderOption = {
  so?: string
  co?: string
  cso?: string
  cco?: string
  cs?: string
}

const CONFIG_ELEMENT_ID = 'onetick-config'

const safeParseConfig = (): OnetickConfig | null => {
  const configNode = document.getElementById(CONFIG_ELEMENT_ID)
  if (!configNode) {
    return null
  }
  try {
    return JSON.parse(configNode.textContent || '{}') as OnetickConfig
  } catch (error) {
    console.error('[OneTick] Unable to parse config JSON', error)
    return null
  }
}

const splitCheckboxes = (metafieldsCheckboxData?: Record<string, any>) => {
  const activeCheckboxes: any[] = []
  const draftCheckboxes: any[] = []
  const defaultOrderOptions: DefaultCheckboxOrderOption
    = (metafieldsCheckboxData?.default_checkboxes_order_option?.value as DefaultCheckboxOrderOption) || {}

  const globalStyling = metafieldsCheckboxData?.global_styling?.value
  Object.entries(metafieldsCheckboxData || {}).forEach(([key, value]) => {
    if (['global_styling', 'default_checkboxes_order_option', 'enable_analytics'].includes(key)) return
    const checkboxData = (value as any)?.value ?? value
    if (!checkboxData) return
    if (checkboxData.isDraft === null || checkboxData.isDraft === undefined) {
      activeCheckboxes.push(checkboxData)
    } else {
      draftCheckboxes.push(checkboxData)
    }
  })
  const fallbackStyleSource = globalStyling ? null : activeCheckboxes[0] || draftCheckboxes[0]

  return { activeCheckboxes, draftCheckboxes, globalStyling, defaultOrderOptions, fallbackStyleSource }
}

const buildCartOrder = (config: OnetickConfig) => {
  if (!config.cart) return null

  const cartCopy = { ...config.cart }
  if (Array.isArray(cartCopy.items)) {
    cartCopy.items = cartCopy.items.map((item: any, index: number) => ({
      ...item,
      product: {
        ...(config.listCartProduct?.[index] || {}),
        collections: config.listCartProductCollections?.[index] || [],
      },
    }))
  }

  return cartCopy
}

const applyCustomSelectorAssets = (customSelector?: { css?: string; js?: string }) => {
  if (!customSelector) return

  if (customSelector.css) {
    const style = document.createElement('style')
    style.textContent = customSelector.css
    document.head.appendChild(style)
  }

  if (customSelector.js) {
    const script = document.createElement('script')
    script.textContent = customSelector.js
    document.head.appendChild(script)
  }
}

const applyCheckboxStyles = (globalStyling: any, fallback: any, checkboxStyling?: CheckboxStyling) => {
  const styleText = createOneTickCheckboxStyleText({
    checkboxStyling,
    metafieldsCheckboxData: globalStyling
      ? { global_styling: { value: globalStyling } }
      : fallback
        ? { fallback: { value: fallback } }
        : undefined,
  })
  if (!styleText) return

  const style = document.getElementById(ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID) || document.createElement('style')
  style.id = ONETICK_CHECKBOX_DYNAMIC_STYLE_ELEMENT_ID
  style.textContent = styleText
  if (!style.parentNode) document.head.appendChild(style)
}

export const bootstrapOnetickStore = () => {
  window.__onetick_store__ = window.__onetick_store__ || {}
  const store = window.__onetick_store__
  const config = safeParseConfig()

  if (!config) {
    store.activeCheckboxes = store.activeCheckboxes || []
    store.draftCheckboxes = store.draftCheckboxes || []
    return store
  }

  const { activeCheckboxes, draftCheckboxes, globalStyling, defaultOrderOptions, fallbackStyleSource }
    = splitCheckboxes(config.metafieldsCheckboxData)

  const enableAnalytics = config.metafieldsCheckboxData?.enable_analytics?.value ?? false
  const sortOption = defaultOrderOptions.so || 'LAST_CREATED_ASC'
  const sortOptionCart = defaultOrderOptions.cso || 'LAST_CREATED_ASC'

  store.enableAnalytics = enableAnalytics
  store.sortOption = { so: sortOption, co: defaultOrderOptions.co ?? '' }
  store.sortOptionCart = {
    cso: sortOptionCart,
    cco: defaultOrderOptions.cco ?? '',
    cs: defaultOrderOptions.cs ?? '',
  }
  store.money_format = config.moneyFormat
  store.storefront = config.storefrontAccessToken
  store.draftCheckboxes = draftCheckboxes
  store.activeCheckboxes = activeCheckboxes
  store.activeCheckboxesProductDetail = activeCheckboxes.filter(item => item.tpl !== 'cart')
  store.activeCheckboxesCart = activeCheckboxes.filter(item => item.tpl === 'cart')
  store.productsCount = config.productsCount
  store.productOffers = config.productOffers || {}
  store.conditions = config.conditions || {}
  store.productOffersStyling = config.metafieldsStylingProductOffers || {}
  store.isCartPage = Boolean(config.isCartPage)
  store.custom_selector = config.customSelector?.csl || ''
  store.mainProduct = config.product

  const cartOrder = buildCartOrder(config)
  if (cartOrder) {
    store.cartOrder = cartOrder
  }

  // Apply checkbox styles with app-platform config as primary source.
  appendOneTickStaticCss(document)
  applyCheckboxStyles(globalStyling, fallbackStyleSource, config.checkboxStyling)
  applyCustomSelectorAssets(config.customSelector)

  return store
}
