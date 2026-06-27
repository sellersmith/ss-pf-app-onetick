// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { createOneTickOrderProperties, ONETICK_ORDER_PROPERTY_KEYS } from './cart-intent'
import type { OneTickSelectedAddonItem } from './runtime-types'

export function collectSelectedOneTickAddonItems(
  variantId: string,
  root: Pick<Document, 'querySelectorAll'> | Pick<HTMLElement, 'querySelectorAll'> = document
): OneTickSelectedAddonItem[] {
  if (!variantId) return []

  const groups = Array.from(root.querySelectorAll('onetick-group-checkboxes')) as HTMLElement[]
  const selectedGroups = groups.filter(group => group.dataset.variantId === variantId)

  return selectedGroups.flatMap(group =>
    (Array.from(group.querySelectorAll('onetick-checkbox')) as HTMLElement[]).flatMap(checkbox => {
      const input = checkbox.querySelector('label[class="onetick-checkbox"] > input[type="checkbox"], input[type="checkbox"]') as
        | HTMLInputElement
        | null
      if (!input?.checked) return []

      const selectedAddonVariantId =
        checkbox.querySelector('onetick-variant-selector > span')?.getAttribute('data-addon-variant-id') || ''
      const addonVariantId = selectedAddonVariantId || checkbox.dataset.upsellVariantId || ''
      if (!addonVariantId) return []

      const checkboxId = checkbox.dataset.checkboxId || ''
      return [
        {
          checkboxId,
          id: addonVariantId,
          quantity: 1,
          properties: createOneTickOrderProperties({
            widgetId: checkboxId,
            addonVariantId,
            triggerVariantId: variantId,
            triggerProductId: checkbox.dataset.targetProduct,
            triggerProductTitle: checkbox.dataset.targetProductTitle,
            canRemoveWhenTriggerRemoved: checkbox.dataset.autoRemoveCheckbox === 'true',
            placement: 'product-details',
          }),
        },
      ]
    })
  )
}

// Shopify themes submit add-to-cart as JSON, FormData, or urlencoded bodies. Keep the same selected
// add-on semantics across all body shapes.
export function appendSelectedOneTickAddonsToJsonItems(
  variantId: string,
  items: unknown,
  root?: Parameters<typeof collectSelectedOneTickAddonItems>[1]
) {
  if (!Array.isArray(items)) return items

  collectSelectedOneTickAddonItems(variantId, root).forEach(checkbox => {
    const onetickProperties = checkbox.properties[ONETICK_ORDER_PROPERTY_KEYS.properties]
    const alreadyAppended = items.some(
      item => item?.properties?.[ONETICK_ORDER_PROPERTY_KEYS.properties] === onetickProperties
    )
    if (alreadyAppended) return

    items.push({
      id: checkbox.id,
      quantity: checkbox.quantity,
      properties: checkbox.properties,
    })
  })

  return items
}

export function appendSelectedOneTickAddonsToFormData(
  variantId: string,
  formData: FormData,
  root?: Parameters<typeof collectSelectedOneTickAddonItems>[1]
): FormData {
  collectSelectedOneTickAddonItems(variantId, root).forEach(checkbox => {
    const propertiesKey = `items[${checkbox.checkboxId}][properties][${ONETICK_ORDER_PROPERTY_KEYS.properties}]`
    if (formData.get(propertiesKey) === checkbox.properties[ONETICK_ORDER_PROPERTY_KEYS.properties]) return

    formData.append(`items[${checkbox.checkboxId}][id]`, checkbox.id)
    formData.append(`items[${checkbox.checkboxId}][quantity]`, String(checkbox.quantity))
    Object.entries(checkbox.properties).forEach(([key, value]) => {
      formData.append(`items[${checkbox.checkboxId}][properties][${key}]`, value)
    })
  })

  return formData
}

export function appendSelectedOneTickAddonsToUrlSearchParams(
  variantId: string,
  params: URLSearchParams,
  root?: Parameters<typeof collectSelectedOneTickAddonItems>[1]
): URLSearchParams {
  collectSelectedOneTickAddonItems(variantId, root).forEach(checkbox => {
    const propertiesKey = `items[${checkbox.checkboxId}][properties][${ONETICK_ORDER_PROPERTY_KEYS.properties}]`
    if (params.get(propertiesKey) === checkbox.properties[ONETICK_ORDER_PROPERTY_KEYS.properties]) return

    params.append(`items[${checkbox.checkboxId}][id]`, checkbox.id)
    params.append(`items[${checkbox.checkboxId}][quantity]`, String(checkbox.quantity))
    Object.entries(checkbox.properties).forEach(([key, value]) => {
      params.append(`items[${checkbox.checkboxId}][properties][${key}]`, value)
    })
  })

  return params
}
