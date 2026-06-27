import { EPlacementType, EWidgetType } from '../../constants'
import { getTitleProductVariantById } from '../main-product-variants'
import { creatOneTickOrderProperties } from '../handle-onetick-order-properites'

export function addAddOnToFormATC(checkbox: HTMLElement, atcForm: HTMLElement) {
  const {
    checkboxId = '',
    upsellVariantId = '',
    targetProduct: targetProductId = '',
    targetProductTitle = '',
    autoRemoveCheckbox = false,
    upsellVariantQuantity = 1,
  } = checkbox.dataset

  const variantId = ((checkbox.closest('onetick-group-checkboxes') as HTMLElement) || null)?.dataset?.variantId || ''

  // Remove previously inputs
  atcForm
    .querySelectorAll(`input.onetick_atc_input[data-checkbox-id="${checkboxId}"]`)
    .forEach(input => input.parentNode?.removeChild(input))
  // Return if checkbox is unselected
  const checkboxInput: HTMLInputElement = checkbox.querySelector('.onetick-checkbox > input') as HTMLInputElement
  if (!checkboxInput.checked) return

  const formAttributes = {
    id: upsellVariantId,
    quantity: upsellVariantQuantity,
  }

  const formData = creatOneTickOrderProperties({
    type: EWidgetType.CHECKBOX,
    placement: EPlacementType.PRODUCT_DETAILS,
    id: checkboxId,
    variantProductId: upsellVariantId,
    masterVariantId: variantId,
    masterVariantTitle: getTitleProductVariantById(variantId),
    masterProductId: targetProductId,
    masterProductTitle: targetProductTitle,
    canRemoved: autoRemoveCheckbox === 'true',
  })

  // Create new inputs
  const createInput = (name: string, value: string) => {
    const input = document.createElement('input')
    input.className = 'onetick_atc_input'
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', name)
    input.setAttribute('value', value)
    input.setAttribute('data-upsell-variant-id', upsellVariantId)
    input.setAttribute('data-checkbox-id', checkboxId)
    atcForm.appendChild(input)
  }
  Object.entries(formAttributes).forEach(([key, value]) => {
    createInput(`items[${checkboxId}][${key}]`, value.toString())
  })
  Object.entries(formData).forEach(([key, value]) => {
    createInput(`items[${checkboxId}][properties][${key}]`, value.toString())
  })
}
