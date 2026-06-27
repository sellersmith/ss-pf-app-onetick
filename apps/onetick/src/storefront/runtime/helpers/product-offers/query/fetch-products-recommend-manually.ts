import { EConditionProductToOffer } from '../../../constants'
import type { ICondition, IProduct } from '../../../types'
import { handleCheckTriggerProducts } from '../handle-check-trigger-products'
import type { IFetchProxyOptions } from './fetch-offer-products'
import fetchOfferProducts from './fetch-offer-products'

export default async function fetchProductRecommendManually(
  cartProducts: IProduct[],
  cartProductIds: string[],
  options?: IFetchProxyOptions
) {
  if (!cartProductIds.length) return []

  const conditions: ICondition[] = Object.values(window.__onetick_store__?.['conditions'] || {}) || []

  const offerProducts = await Promise.all(
    conditions.map(async condition => {
      const parsedCondition = typeof condition === 'string' ? JSON.parse(condition) : condition
      const { ct, mcic, tp, tpt, op, opt, isDraft } = parsedCondition || {}

      if (isDraft) return []

      // For future condition types. Currently, we are only using it in the case of product-in-cart.
      if (ct !== 'products-in-cart') {
        return []
      }

      const isCartContainTriggerProduct = await handleCheckTriggerProducts(cartProducts, tpt, tp)

      if (isCartContainTriggerProduct === mcic) {
        const offerProducts: IProduct[] = await fetchOfferProducts(
          opt,
          opt === EConditionProductToOffer.BEST_SELLING ? cartProductIds : op,
          options
        )

        return offerProducts
      }

      return []
    })
  )

  return offerProducts.flat()
}
