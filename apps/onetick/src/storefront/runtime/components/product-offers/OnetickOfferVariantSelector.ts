/* eslint-disable no-useless-constructor */

import { EMedia } from '../../constants'

class OnetickOfferVariantSelector extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const variantSelectElement = this.querySelector('select')
    if (!variantSelectElement) return

    variantSelectElement.addEventListener('change', (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()
      // Get the price and compared price of selected variant from hidden <select> tag
      const selectedOfferVariantOption = variantSelectElement.querySelector(
        `option[value='${(e.target as any).value}']`
      )

      if (!selectedOfferVariantOption) return

      const currentProductItem = this.closest('.onetick-offer-product')
      if (!currentProductItem) return

      const atcButton = currentProductItem.querySelector('.onetick-upsell-button')
      const disableAtcButton = currentProductItem.querySelector('.onetick-upsell-button.disable')

      if (atcButton) {
        atcButton.setAttribute('data-variant-id', (e.target as any).value)
      }

      const variantPriceElement = currentProductItem.querySelector('.onetick-offer-item-price')
      if (variantPriceElement) {
        const selectedOfferVariantPrice = selectedOfferVariantOption.getAttribute('data-price') || ''
        variantPriceElement.textContent = selectedOfferVariantPrice
      }

      const comparedVariantPriceElement = currentProductItem.querySelector('.onetick-offer-item-compared-price')
      if (comparedVariantPriceElement) {
        const selectedOfferVariantComparedPrice = selectedOfferVariantOption.getAttribute('data-compared-price') || ''
        comparedVariantPriceElement.textContent = selectedOfferVariantComparedPrice
      }

      const productImage = currentProductItem.querySelector('.onetick-offer-item-img')
      if (productImage) {
        const newProductImage = selectedOfferVariantOption.getAttribute('data-variant-img') || ''
        if (newProductImage) {
          productImage.setAttribute('src', newProductImage)
        } else {
          const featuredImage = this.getAttribute('data-featured-image') || ''
          if (featuredImage) {
            productImage.setAttribute('src', featuredImage)
          } else {
            const isHorizontal = this.getAttribute('data-horizontal') === 'true'
            productImage.setAttribute(
              'src',
              isHorizontal ? EMedia.PLACEHOLDER_IMAGE_SQUARE : EMedia.PLACEHOLDER_IMAGE_RECT
            )
          }
        }
      }

      const availableForSales = selectedOfferVariantOption.getAttribute('data-available-for-sale')

      if (availableForSales === 'true') {
        this.showButton(atcButton)
        this.hideButton(disableAtcButton)
      } else {
        this.showButton(disableAtcButton)
        this.hideButton(atcButton)
      }
    })
  }

  showButton = (btn: Element | null, display: 'flex' | 'block' = 'block') => {
    if (!btn) return
    ;(btn as HTMLElement).style.display = display
  }

  hideButton = (btn: Element | null) => {
    if (!btn) return
    ;(btn as HTMLElement).style.display = 'none'
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-offer-variant-selector')
  || customElements.define('onetick-offer-variant-selector', OnetickOfferVariantSelector)
