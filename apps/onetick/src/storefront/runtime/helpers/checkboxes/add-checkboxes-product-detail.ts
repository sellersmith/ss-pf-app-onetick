import { EOneTickOrdersProperties, EPlacementType, EWidgetType } from '../../constants'
import { addToCart } from '../../utils/ajax-api'
import { sendAddedUpsellEvent } from '../../utils/ga4'
import { getTitleProductVariantById } from '../main-product-variants'
import { creatOneTickOrderProperties } from '../handle-onetick-order-properites'

interface ICheckboxesATCData {
  checkboxId: string
  id: string
  quantity: number
  properties: any
}

/**
 * @author Sona
 * @param variantId id variant of trigger product
 * @returns array of object with properties of checkbox
 */
export const getCheckboxesATCData = (variantId: string) => {
  const onetickGroupCheckboxes = document.querySelector(`onetick-group-checkboxes[data-variant-id="${variantId}"]`)
  const checkboxes = Array.from(onetickGroupCheckboxes?.querySelectorAll('onetick-checkbox') || []) as HTMLElement[]
  const result: ICheckboxesATCData[] = []

  checkboxes.forEach(checkbox => {
    const {
      checkboxId = '',
      upsellVariantId = '',
      targetProduct: targetProductId = '',
      targetProductTitle = '',
      autoRemoveCheckbox = false,
    } = checkbox.dataset

    const input = checkbox.querySelector('label[class="onetick-checkbox"] > input[type="checkbox"]') as HTMLInputElement
    const isCheckedInput = input.checked

    // Return add to cart function when checkbox is un-checked
    if (!isCheckedInput) return

    // Get the selected add-on variant in Variant Selector
    const selectedAddonVariantId
      = checkbox.querySelector('onetick-variant-selector > span')?.getAttribute('data-addon-variant-id') || ''
    const addonVariantId = selectedAddonVariantId || upsellVariantId
    const addonVariantTitle = getTitleProductVariantById(variantId)

    const properties = creatOneTickOrderProperties({
      type: EWidgetType.CHECKBOX,
      placement: EPlacementType.PRODUCT_DETAILS,
      id: checkboxId,
      variantProductId: addonVariantId,
      masterVariantId: variantId,
      masterVariantTitle: addonVariantTitle,
      masterProductId: targetProductId,
      masterProductTitle: targetProductTitle,
      canRemoved: autoRemoveCheckbox === 'true',
    })

    const data = {
      checkboxId,
      id: addonVariantId,
      quantity: 1,
      properties,
    }
    result.push(data)

    // Send GA4 event
    if (window.__onetick_store__?.enableAnalytics === true) {
      const events = {
        onetick_upsell_atc_count: isCheckedInput ? 1 : 0,
        onetick_checkbox_placement: EPlacementType.PRODUCT_DETAILS,
        onetick_checkbox_id: checkboxId,
      }
      sendAddedUpsellEvent(events)
    }
  })

  return result
}

export const addCartManual = async (variantId: string) => {
  const items: { id: string; quantity: number; properties: any }[] = []
  const checkboxes = getCheckboxesATCData(variantId)

  checkboxes.forEach(checkbox => {
    const { id, quantity, properties } = checkbox

    items.push({
      id,
      quantity,
      properties,
    })
  })

  return addToCart(JSON.stringify({ items }))
}

/**
 * @author Sona
 *
 * @description
 * Use in cases where the trigger product is added to the cart via the /cart/add.js API.
 * In this case, information about the trigger product is stored in the body.items array as JSON.
 * This function will proceed to add the addon product to body.items
 *
 * @link https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 *
 */
export const handleAddCheckboxesATCDataByJSON = (variantId: string, items: any) => {
  if (!Array.isArray(items) || !items.length) return items

  const checkboxes = getCheckboxesATCData(variantId)
  checkboxes.forEach(checkbox => {
    const { id, quantity, properties } = checkbox

    items.push({
      id,
      quantity,
      properties,
    })
  })

  return items
}

export const handleAddCheckboxesATCDataByParams = (variantId: string, params: URLSearchParams) => {
  if (!(params instanceof URLSearchParams) || !variantId) return params

  const checkboxes = getCheckboxesATCData(variantId)
  checkboxes.forEach(checkbox => {
    const { checkboxId, id, quantity, properties } = checkbox

    params.append(`items[${checkboxId}][id]`, id)
    params.append(`items[${checkboxId}][quantity]`, `${quantity}`)
    Object.entries(properties).forEach(([key, value]) => {
      params.append(`items[${checkboxId}][properties][${key}]`, `${value}`)
    })
  })

  return params.toString()
}

/**
 * @author Sona
 *
 * @description
 * Use in cases where the trigger product is added to the cart via the /cart/add API.
 * In this case, information about the trigger product is stored in formData inside the body.
 * This function will add the addon product to formData
 *
 * @link https://shopify.dev/docs/api/ajax/reference/cart#post-locale-cart-add-js
 */
export const handleAddCheckboxesATCDataByFormData = (variantId: string, formData: FormData) => {
  if (!(formData instanceof FormData) || !variantId) return formData

  try {
    const checkboxes = getCheckboxesATCData(variantId)
    checkboxes.forEach(checkbox => {
      const { checkboxId, id, quantity, properties } = checkbox

      formData.append(`items[${checkboxId}][id]`, id)
      formData.append(`items[${checkboxId}][quantity]`, `${quantity}`)
      Object.entries(properties).forEach(([key, value]) => {
        formData.append(`items[${checkboxId}][properties][${key}]`, `${value}`)
      })
    })
  } catch (err) {
    console.error('[Onetick] Add checkboxes error:', err)
  }

  return formData
}

export const isRequestFromOldVersionCustomCodeForATC = (items: any) => {
  if (!Array.isArray(items) || !items.length) return false

  return items.every((item: any) => item?.properties?.[EOneTickOrdersProperties.ONETICK_CHECKBOX_ID_FLAG])
}
