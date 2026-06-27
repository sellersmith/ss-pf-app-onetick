import { EPlacementType, EWidgetType } from '../../constants'
import { addToCart } from '../../utils/ajax-api'
import handleUpdateCart from '../../utils/update-cart'
import { creatOneTickOrderProperties } from '../handle-onetick-order-properites'
import { getMainProductTitle } from '../main-product'

export default function addEventUpsell(callback?: Function) {
  const onetickUpsellItems = document.querySelectorAll('.onetick-offer-product')

  onetickUpsellItems.forEach(item => {
    const productId = item?.getAttribute('data-product-id')
    if (!productId) {
      return
    }

    const atcButton = item.querySelector('.onetick-upsell-button')

    if (!atcButton) return

    const isAddedEvent = atcButton.getAttribute('data-added-event')
    if (isAddedEvent) return

    atcButton.setAttribute('data-added-event', 'true')

    atcButton?.addEventListener('click', async e => {
      e.preventDefault()
      const idVariantSelected = atcButton.getAttribute('data-variant-id')
      const productOfferId = item.closest('onetick-product-offers')?.getAttribute('data-product-offer-id') || ''
      const placement
        = item.closest('onetick-product-offers')?.getAttribute('data-product-offer-placement') || EPlacementType.CART

      if (idVariantSelected) {
        atcButton.classList.add('loading')
        const properties = creatOneTickOrderProperties({
          type: EWidgetType.PRODUCT_OFFER,
          id: productOfferId,
          placement: placement as EPlacementType,
          masterProductTitle: getMainProductTitle(),
        })
        const body = JSON.stringify({
          items: [
            {
              id: idVariantSelected,
              quantity: Number((item.querySelector('.onetick-quantity-selector') as HTMLInputElement)?.value || 1),
              properties,
            },
          ],
        })

        await addToCart(body)
          .then(async res => {
            if (res?.message && res?.description) {
              throw new Error(res)
            }
            const cart = await fetch(`${window.Shopify.routes.root}cart.js`).then(response => response.json())

            return { cart, addedItemRes: res }
          })
          .then(async ({ addedItemRes, cart }) => {
            handleUpdateCart(addedItemRes, cart)
          })
          .catch(error => console.error('[OneTick] Failed to upsell product:', error?.message))
          .finally(() => {
            atcButton.classList.remove('loading')
          })

        typeof callback === 'function' && callback()
      }
    })
  })
}
