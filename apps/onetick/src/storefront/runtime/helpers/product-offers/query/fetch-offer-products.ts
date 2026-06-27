import { EAPIAppProxyTypes, EConditionProductToOffer } from '../../../constants'
import { fetchProductsAppProxy } from './fetch-products'

const {
  GET_PRODUCTS_FROM_COLLECTION_IDS,
  GET_PRODUCTS_FROM_TAGS,
  GET_PRODUCTS_FROM_TYPES,
  GET_PRODUCTS_FROM_VENDORS,
  GET_PRODUCTS_FROM_IDS,
  GET_TOP_SELLER_PRODUCTS,
} = EAPIAppProxyTypes

export interface IFetchProxyOptions {
  limit: number
}

export default async function fetchOfferProducts(
  type: EConditionProductToOffer,
  ids: string[],
  options?: IFetchProxyOptions
) {
  switch (type) {
    case EConditionProductToOffer.BEST_SELLING:
      return fetchProductsAppProxy([], GET_TOP_SELLER_PRODUCTS, options)

    case EConditionProductToOffer.PRODUCTS_FROM_COLLECTIONS:
      return fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_COLLECTION_IDS, options)

    case EConditionProductToOffer.PRODUCTS_WITH_TAGS:
      return fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_TAGS, options)

    case EConditionProductToOffer.PRODUCTS_FROM_VENDORS:
      return fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_VENDORS, options)

    case EConditionProductToOffer.PRODUCTS_OF_PRODUCT_TYPES:
      return fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_TYPES, options)

    case EConditionProductToOffer.SPECIFIC_PRODUCTS:
      return fetchProductsAppProxy(ids, GET_PRODUCTS_FROM_IDS, options)
    default:
      return []
  }
}
