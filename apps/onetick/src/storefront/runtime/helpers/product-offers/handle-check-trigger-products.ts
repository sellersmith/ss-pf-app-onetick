import { EAPIAppProxyTypes, EConditionProductsTriggerSettings } from '../../constants'
import type { IProduct } from '../../types'
import { fetchProductsAppProxy } from './query/fetch-products'

const { FROM_COLLECTIONS, WITH_TAGS, FROM_VENDORS, OF_PRODUCT_TYPES, FROM_CUSTOM_LIST }
  = EConditionProductsTriggerSettings

export const handleCheckTriggerProducts = async (
  cartProducts: IProduct[],
  tpt: EConditionProductsTriggerSettings,
  tp: string[]
): Promise<Boolean> => {
  switch (tpt) {
    case FROM_COLLECTIONS: {
      const productsFromCollections = await fetchProductsAppProxy(
        tp,
        EAPIAppProxyTypes.GET_PRODUCTS_FROM_COLLECTION_IDS
      )

      return cartProducts.some(({ id: cpid }) => productsFromCollections.some(({ id }) => id === cpid))
    }

    case WITH_TAGS: {
      return cartProducts.some(({ tags }) => tp.some(tpt => tags?.includes(tpt)))
    }

    case FROM_VENDORS: {
      return cartProducts.some(({ vendor }) => tp.some(tpv => vendor === tpv))
    }

    case OF_PRODUCT_TYPES: {
      return cartProducts.some(({ productType }) => tp.some(tpv => productType === tpv))
    }

    case FROM_CUSTOM_LIST: {
      return cartProducts.some(({ id: cpid }) => tp.some(tpid => cpid === tpid))
    }
  }
}
