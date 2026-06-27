import { EPlacementType, SESSION_KEYS, EAPIAppProxyTypes } from '../../../constants'
import type { IProduct, IProductOfferMetafieldData } from '../../../types'
import { getOneTickAppProxyPath } from '../../../utils/app-proxy-path'
import type { IFetchProxyOptions } from './fetch-offer-products'
import { fetchAddonVariantsByProductIdsDirect, fetchProductsByIdsDirect } from './fetch-products-via-storefront-api'

export const fetchProductsAppProxyCached = new Map<string, Promise<IProduct[]>>()
export const fetchProductToOfferAppProxyCached = new Map<
  string,
  Promise<{ message: string; productsToOffer: IProduct[]; productOffer: IProductOfferMetafieldData }>
>()

// Map EAPIAppProxyTypes to storefront action strings
const API_TYPE_TO_ACTION: Record<EAPIAppProxyTypes, string> = {
  [EAPIAppProxyTypes.GET_DATA_ADDON_VARIANT_CHECKBOX]: 'get-data-addon-variant-checkbox',
  [EAPIAppProxyTypes.GET_PRODUCTS_FROM_IDS]: 'get-products-from-ids',
  [EAPIAppProxyTypes.GET_PRODUCTS_AUTO_RECOMMENDATION]: 'get-products-auto-recommendation',
  [EAPIAppProxyTypes.GET_PRODUCTS_FROM_COLLECTION_IDS]: 'get-products-from-collection-ids',
  [EAPIAppProxyTypes.GET_PRODUCTS_FROM_TAGS]: 'get-products-from-tags',
  [EAPIAppProxyTypes.GET_PRODUCTS_FROM_TYPES]: 'get-products-from-types',
  [EAPIAppProxyTypes.GET_PRODUCTS_FROM_VENDORS]: 'get-products-from-vendors',
  [EAPIAppProxyTypes.GET_TOP_SELLER_PRODUCTS]: 'get-top-seller-products',
  [EAPIAppProxyTypes.GET_PRODUCTS_TO_OFFER_LIVE_VIEW]: 'get-products-to-offer-live-view',
  [EAPIAppProxyTypes.GET_CREATE_TIME_SHOP]: 'get-create-time-shop',
}

async function readAppProxyJson(response: Response, action: string): Promise<any | null> {
  const contentType = response.headers?.get('content-type') || ''

  if (!response.ok) {
    console.warn('[OneTick] App proxy request failed:', { action, status: response.status })
    return null
  }

  if (typeof response.text !== 'function') {
    return typeof response.json === 'function' ? response.json() : null
  }

  const text = await response.text()

  if (!text.trim()) return null

  if (!contentType.includes('json') && text.trimStart().startsWith('<')) {
    console.warn('[OneTick] App proxy returned non-JSON response:', { action, status: response.status })
    return null
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn('[OneTick] App proxy JSON parse failed:', { action, error })
    return null
  }
}

export const fetchProductsAppProxy = async (
  ids: string[],
  type: EAPIAppProxyTypes,
  options?: IFetchProxyOptions
): Promise<IProduct[]> => {
  // For GET_PRODUCTS_FROM_IDS: call Storefront API directly (skip app proxy)
  if (type === EAPIAppProxyTypes.GET_PRODUCTS_FROM_IDS) {
    const directResult = await fetchProductsByIdsDirect(ids, window.Shopify.country || 'US')
    if (directResult) return options?.limit ? directResult.slice(0, options.limit) : directResult
    // Fall through to proxy if direct API unavailable (no storefront token)
  }

  if (type === EAPIAppProxyTypes.GET_DATA_ADDON_VARIANT_CHECKBOX) {
    const directResult = await fetchAddonVariantsByProductIdsDirect(ids, window.Shopify.country || 'US', options?.limit)
    if (directResult) return directResult as unknown as IProduct[]
  }

  const keyCached = ids.sort().toString() + type + window.Shopify.country
  const storefront = window.__onetick_store__?.['storefront']
  const action = API_TYPE_TO_ACTION[type] || type

  if (!fetchProductsAppProxyCached.has(keyCached)) {
    const fetchPromise = new Promise<IProduct[]>(resolve => {
      const formData = new FormData()
      formData.append('body', JSON.stringify({ country: window.Shopify.country, ids, options }))
      formData.append('action', action)

      return fetch(`${getOneTickAppProxyPath()}/app_proxy/storefront`, {
        method: 'POST',
        headers: storefront ? { 'X-Shopify-Storefront-Access-Token': storefront } : {},
        body: formData,
      })
        .then(res => readAppProxyJson(res, action))
        .then(res => resolve(Array.isArray(res?.data) ? res.data : []))
        .catch(error => {
          console.warn('[OneTick] App proxy request error:', { action, error })
          resolve([])
        })
    })

    fetchProductsAppProxyCached.set(keyCached, fetchPromise)
  }

  return fetchProductsAppProxyCached.get(keyCached) || []
}

export const fetchAppProxyProductsToOffer = async (
  triggerProducts: string[],
  placement: string,
  type: EAPIAppProxyTypes,
  options?: IFetchProxyOptions
): Promise<{ message: string; productsToOffer: IProduct[]; productOffer: IProductOfferMetafieldData | null }> => {
  const { shop, country } = window.Shopify
  let behaviors = sessionStorage.getItem(SESSION_KEYS.BEHAVIORS) || ''
  placement === EPlacementType.PRODUCT_PAGE && (behaviors += `${triggerProducts[0]}:0`)
  const keyCached = triggerProducts.sort().toString() + type + shop + country + placement + behaviors
  const storefront = window.__onetick_store__?.['storefront']
  const action = API_TYPE_TO_ACTION[type] || type

  const cachedReponse = fetchProductToOfferAppProxyCached.get(keyCached)
  if (cachedReponse) {
    return cachedReponse
  }

  const fetchPromise = new Promise<{ message: string; productsToOffer: IProduct[]; productOffer: any }>(
    resolve => {
      const formData = new FormData()
      formData.append('body', JSON.stringify({ shop, country, placement, triggerProducts, options, behaviors }))
      formData.append('action', action)

      return fetch(`${getOneTickAppProxyPath()}/app_proxy/storefront`, {
        method: 'POST',
        headers: storefront ? { 'X-Shopify-Storefront-Access-Token': storefront } : {},
        body: formData,
      })
        .then(res => readAppProxyJson(res, action))
        .then(res =>
          resolve(
            res || {
              message: 'Fail to fetch product to offer',
              productsToOffer: [],
              productOffer: null,
            }
          )
        )
        .catch(error => {
          console.warn('[OneTick] App proxy product-offer request error:', { action, error })
          resolve({
            message: 'Fail to fetch product to offer',
            productsToOffer: [],
            productOffer: null,
          })
        })
    }
  )

  fetchProductToOfferAppProxyCached.set(keyCached, fetchPromise)
  return (
    fetchProductToOfferAppProxyCached.get(keyCached) || {
      message: 'Fail to fetch product to offer',
      productsToOffer: [],
      productOffer: null,
    }
  )
}
