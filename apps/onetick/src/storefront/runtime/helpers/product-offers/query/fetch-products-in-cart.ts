import { EAPIAppProxyTypes, EOneTickOrderPropertyKeys } from '../../../constants'
import type { IProduct } from '../../../types'
import { lastFetchedCartProducts } from '../../../utils/observe-cart-changes'
import { fetchProductsAppProxy } from './fetch-products'

const defaultResponse = {
  allProducts: [],
  allProductIds: [],
  productFromOneTickIds: [],
  allProductProperties: [],
  allProductIncludeAddonAndProperties: [],
}

export const fetchProductsInCart = async (
  allowFetchProxy: boolean = true
): Promise<{
  allProducts: IProduct[]
  allProductIds: string[]
  productFromOneTickIds: string[]
  allProductProperties: any[]
  allProductIncludeAddonAndProperties: any[]
}> => {
  try {
    let order = [],
      productIds: string[] = [],
      productProperties: any[] = []

    if (window.__onetick_store__?.['cartOrder']) {
      order = window.__onetick_store__['cartOrder']
      lastFetchedCartProducts.items = order.items
      delete window.__onetick_store__.cartOrder
    } else {
      order = await fetch(`${window.Shopify.routes.root}cart.js`)
        .then(res => res.json())
        .catch(e => console.error(e))
    }

    productIds = (order?.items || []).map((item: any) => item.product_id.toString())

    productProperties = (order?.items || []).map((item: any) => item.properties)

    if (!productIds?.length) return defaultResponse

    const dataProductWithIds = await fetchProductsAppProxy(productIds, EAPIAppProxyTypes.GET_PRODUCTS_FROM_IDS)

    const allProducts: IProduct[] = allowFetchProxy
      ? (order?.items || []).map((item: any) => {
          const data = dataProductWithIds.find((product: any) => +item.product_id === +product?.id)
          return {
            ...data,
            variant_id: item.variant_id,
          }
        })
      : []

    const productFromOneTickIds = (order?.items || [])
      .filter((item: any) => item.properties[EOneTickOrderPropertyKeys.ONETICK_PROPERTIES])
      .map((item: any) => item.product_id.toString())

    const allProductIncludeAddonAndProperties = (order?.items || []).map(
      ({ product_id, variant_id, properties, key }: any) => {
        const data = allProducts.find((item: any) => +product_id === +item?.id)
        return {
          ...data,
          key,
          variant_id,
          properties,
        }
      }
    )
    return {
      allProducts,
      allProductIds: productIds,
      productFromOneTickIds,
      allProductProperties: productProperties,
      allProductIncludeAddonAndProperties,
    }
  } catch (e) {
    console.error('[OneTick] Error fetching cart products', e)

    return defaultResponse
  }
}

export const fetchProductIncludeAddonAndProperties = async (cartItems: any[]) => {
  const productIds = (cartItems || []).map((item: any) => item.product_id.toString())
  const allProducts: IProduct[] = await fetchProductsAppProxy(productIds, EAPIAppProxyTypes.GET_PRODUCTS_FROM_IDS)

  return (cartItems || []).map(({ product_id, variant_id, properties, key }: any) => {
    const data = allProducts.find((item: any) => +product_id === +item?.id)
    return {
      ...data,
      key,
      variant_id,
      properties,
    }
  })
}
