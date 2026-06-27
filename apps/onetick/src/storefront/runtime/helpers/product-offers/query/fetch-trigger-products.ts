import { EAPIAppProxyTypes, EConditionProductsTriggerSettings } from '../../../constants'
import type { IProduct } from '../../../types'
import { fetchProductsAppProxy } from './fetch-products'

const { GET_PRODUCTS_FROM_COLLECTION_IDS, GET_PRODUCTS_FROM_TAGS, GET_PRODUCTS_FROM_TYPES, GET_PRODUCTS_FROM_VENDORS }
  = EAPIAppProxyTypes

export default async function fetchTriggerProductIds(
  type: EConditionProductsTriggerSettings,
  ids: string[]
): Promise<string[]> {
  switch (type) {
    case EConditionProductsTriggerSettings.FROM_COLLECTIONS: {
      const products = await fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_COLLECTION_IDS)
      return products.map(({ id }: IProduct) => id)
    }

    case EConditionProductsTriggerSettings.WITH_TAGS: {
      const products = await fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_TAGS)
      return products.map(({ id }: IProduct) => id)
    }

    case EConditionProductsTriggerSettings.FROM_VENDORS: {
      const products = await fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_VENDORS)
      return products.map(({ id }: IProduct) => id)
    }

    case EConditionProductsTriggerSettings.OF_PRODUCT_TYPES: {
      const products = await fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_TYPES)
      return products.map(({ id }: IProduct) => id)
    }

    case EConditionProductsTriggerSettings.FROM_CUSTOM_LIST: {
      return ids
    }
    default:
      return []
  }
}
