import { EPlacementType, EWidgetType } from '../../constants'
import { addToCart } from '../../utils/ajax-api'
import { sendAddedUpsellEvent } from '../../utils/ga4'
import handleUpdateCart from '../../utils/update-cart'
import { creatOneTickOrderProperties } from '../handle-onetick-order-properites'

export default async function addCartWithCheckBox(checkboxElement: any) {
  const checkboxId = checkboxElement.getAttribute('data-checkbox-id')
  const checkboxUpsellVariantId = checkboxElement.getAttribute('data-upsell-variant-id') || ''
  const selectedAddonVariantId
    = checkboxElement.querySelector('onetick-variant-selector > span')?.getAttribute('data-addon-variant-id') || ''
  const addonVariantId = selectedAddonVariantId || checkboxUpsellVariantId

  if (window.__onetick_store__?.enableAnalytics) {
    const events = {
      onetick_checkbox_placement: EPlacementType.CART,
      onetick_upsell_atc_count: 1,
      onetick_checkbox_id: checkboxId,
    }
    sendAddedUpsellEvent(events)
  }

  const { tp, tpt, rwtc }
    = (window.__onetick_store__?.activeCheckboxesCart || []).find((checkbox: any) => checkbox.id === checkboxId) || {}

  const properties = creatOneTickOrderProperties({
    type: EWidgetType.CHECKBOX,
    id: checkboxId,
    placement: EPlacementType.CART,
    canRemoved: rwtc,
    data: { tp, tpt },
  })

  const formItem = {
    id: addonVariantId,
    quantity: 1,
    properties,
  }

  checkboxElement.style['pointer-events'] = 'none'
  try {
    const body = JSON.stringify({ items: [formItem] })
    const res = await addToCart(body)

    if (res?.message && res?.description) {
      throw new Error(res)
    }

    const cart = await fetch(`${window.Shopify.routes.root}cart.js`).then(response => response.json())
    await handleUpdateCart(res, cart)
  } catch (error: any) {
    console.error('[OneTick] Failed to upsell product:', error?.message)
  } finally {
    checkboxElement.style.pointerEvents = 'auto'
  }
}
