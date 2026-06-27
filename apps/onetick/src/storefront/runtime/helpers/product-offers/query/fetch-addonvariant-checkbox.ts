import { EAPIAppProxyTypes } from '../../../constants'
import { formatShopifyMoney } from '../../../utils/format-currency'
import { fetchProductsAppProxy } from './fetch-products'

export default async function fetchAddOnVariantCheckbox() {
  try {
    const productDetailCheckbox = window.__onetick_store__?.activeCheckboxes
    if (!productDetailCheckbox || !(productDetailCheckbox || []).length) return
    const productIdsProductDetailCheckbox = productDetailCheckbox?.map((item: any) => item.up)
    const _addonVariants = await fetchProductsAppProxy(
      productIdsProductDetailCheckbox,
      EAPIAppProxyTypes.GET_DATA_ADDON_VARIANT_CHECKBOX
    )

    if (_addonVariants && _addonVariants.length) {
      window.__onetick_store__ = window.__onetick_store__ || {}
      window.__onetick_store__['addonVariants'] = _addonVariants.reduce((acc: any, item: any) => {
        acc[item.id] = {
          ...item,
          addonVariantPrice: `${formatShopifyMoney(item.addonVariantPrice)}`,
          addonVariantComparedPrice: `${formatShopifyMoney(item.addonVariantComparedPrice)}`,
        }
        return acc
      }, {})
    }
  } catch (error) {
    console.error('[OneTick]: Error when fetching addon variant checkbox', error)
  }
}
