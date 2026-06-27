import {
  ALL_PRODUCTS,
  ARRAY_SEPARATOR,
  EAPIAppProxyTypes,
  ECheckboxSortOptions,
  ETriggerProductsType,
} from '../../constants'
import type { VariantChangeListener } from '../../modules/variant-change-listener'
import { fetchProductsAppProxy } from '../product-offers/query/fetch-products'

// Split string field that may use old separator ('; ') or new separator ('|||')
const splitField = (value: string): string[] => {
  if (value.includes('|||')) return value.split('|||')
  return value.split('; ')
}

export const sortCheckboxes = (appliedCheckboxesMatchCondition: any, sortOption: any) => {
  const { addonVariants } = window.__onetick_store__
  let sortedCheckboxesData = appliedCheckboxesMatchCondition

  try {
    switch (sortOption.so) {
      case ECheckboxSortOptions.LAST_CREATED_ASC:
        sortedCheckboxesData = appliedCheckboxesMatchCondition.sort((a: any, b: any) => parseInt(a.ca) - parseInt(b.ca))
        break
      case ECheckboxSortOptions.LAST_CREATED_DESC:
        sortedCheckboxesData = appliedCheckboxesMatchCondition.sort((a: any, b: any) => parseInt(b.ca) - parseInt(a.ca))
        break
      case ECheckboxSortOptions.UPSELL_PRODUCT_PRICE_ASC:
        sortedCheckboxesData = appliedCheckboxesMatchCondition.sort((a: any, b: any) => {
          const priceA = addonVariants[a.uv].addonVariantPrice.replace(/[^0-9.-]+/g, '')
          const priceB = addonVariants[b.uv].addonVariantPrice.replace(/[^0-9.-]+/g, '')
          return parseInt(priceA) - parseInt(priceB)
        })
        break
      case ECheckboxSortOptions.UPSELL_PRODUCT_PRICE_DESC:
        sortedCheckboxesData = appliedCheckboxesMatchCondition.sort((a: any, b: any) => {
          const priceA = addonVariants[a.uv].addonVariantPrice.replace(/[^0-9.-]+/g, '')
          const priceB = addonVariants[b.uv].addonVariantPrice.replace(/[^0-9.-]+/g, '')
          return parseInt(priceB) - parseInt(priceA)
        })
        break
      default:
        const manuallyCheckboxesOrder = sortOption.co.split(ARRAY_SEPARATOR)
        sortedCheckboxesData = appliedCheckboxesMatchCondition.sort((a: any, b: any) => {
          const indexA = manuallyCheckboxesOrder.indexOf(a.id)
          const indexB = manuallyCheckboxesOrder.indexOf(b.id)
          return indexA - indexB
        })
        break
    }
    return sortedCheckboxesData
  } catch (error) {
    console.error(error)
  }
}

export const filterCheckboxForMasterProduct = async (
  activeCheckboxes: any,
  currentMasterProductId: string,
  listerner?: VariantChangeListener
) => {
  const { addonVariants } = window.__onetick_store__
  let triggerProducts = (await fetchProductsAppProxy(
    [currentMasterProductId],
    EAPIAppProxyTypes.GET_PRODUCTS_FROM_IDS
  )) as any
  if (triggerProducts && triggerProducts.length) {
    triggerProducts = triggerProducts[0]
  }

  // return activeCheckboxes

  const appliedCheckboxesForMasterProduct = activeCheckboxes.filter(({ tp, up, uv, exc, tpt, etp, ett }: any) => {
    // Remove checkboxes contain the inactive or draft addon variant
    if (!addonVariants[uv]) return false
    const tpa = typeof tp === 'string' ? splitField(tp) : tp

    // Remove checkboxes contain the excluded product
    if (etp && ett) {
      const epa = typeof etp === 'string' ? splitField(etp) : etp
      switch (ett) {
        case ETriggerProductsType.PRODUCT_COLLECTIONS: {
          const collectionIds = triggerProducts?.collections || []
          if (collectionIds.find((cId: string) => epa.indexOf(`${cId}`) !== -1)) return false
        }
        case ETriggerProductsType.PRODUCT_TAGS: {
          const tags = triggerProducts?.tags || []
          if (tags.find((tag: string) => epa.includes(tag))) return false
        }
        case ETriggerProductsType.PRODUCT_VERDORS: {
          const vendor = triggerProducts?.vendor || ''
          if (epa.includes(vendor)) return false
        }
        case ETriggerProductsType.PRODUCT_TYPES: {
          const type = triggerProducts?.productType || ''
          if (epa.includes(type)) return false
        }
        case ETriggerProductsType.SPECIFIC_PRODUCTS: {
          if (epa.includes(currentMasterProductId)) return false
        }
        case ETriggerProductsType.SPECIFIC_VARIANTS: {
          const selectedVariantElement = listerner?.getSelectedVariant()
          if (!selectedVariantElement || epa.includes(selectedVariantElement.value)) return false
        }
      }
    }

    // Remove checkboxes contain the current master product
    switch (tpt) {
      case ETriggerProductsType.ALL_PRODUCTS: {
        return !exc || !up.includes(currentMasterProductId)
      }
      case ETriggerProductsType.PRODUCT_COLLECTIONS: {
        const collectionIds = triggerProducts?.collections || []
        return (
          !!collectionIds.find((cId: string) => tpa.indexOf(`${cId}`) !== -1)
          && (!exc || !up.includes(currentMasterProductId))
        )
      }
      case ETriggerProductsType.PRODUCT_TAGS: {
        const tags = triggerProducts?.tags || []
        return !!tags.find((tag: string) => tpa.includes(tag)) && (!exc || !up.includes(currentMasterProductId))
      }
      case ETriggerProductsType.PRODUCT_VERDORS: {
        const vendor = triggerProducts?.vendor || ''
        return tpa.includes(vendor) && (!exc || !up.includes(currentMasterProductId))
      }
      case ETriggerProductsType.PRODUCT_TYPES: {
        const type = triggerProducts?.productType || ''
        return tpa.includes(type) && (!exc || !up.includes(currentMasterProductId))
      }
      case ETriggerProductsType.SPECIFIC_PRODUCTS: {
        return tpa.includes(currentMasterProductId)
      }
      case ETriggerProductsType.SPECIFIC_VARIANTS: {
        const selectedVariantElement = listerner?.getSelectedVariant()
        return selectedVariantElement && tpa.includes(selectedVariantElement.value)
      }
      default:
        if (tpa.includes(ALL_PRODUCTS)) {
          return !exc || !up.includes(currentMasterProductId)
        }
        return tpa.includes(currentMasterProductId)
    }
  })
  return appliedCheckboxesForMasterProduct
}

/**
 * Filters the checkboxes to include only those with a trigger product type of `SPECIFIC_VARIANTS`.
 *
 * @param checkboxes - The array of checkboxes to filter.
 * @returns An array of checkboxes where the trigger product type is `SPECIFIC_VARIANTS`.
 *
 * @author Sona
 */
export const filterCheckboxTriggerByVariants = (checkboxes: any) => {
  return checkboxes.filter(
    ({ tpt, ett }: { tpt: ETriggerProductsType; ett: ETriggerProductsType }) =>
      tpt === ETriggerProductsType.SPECIFIC_VARIANTS || ett === ETriggerProductsType.SPECIFIC_VARIANTS
  )
}
