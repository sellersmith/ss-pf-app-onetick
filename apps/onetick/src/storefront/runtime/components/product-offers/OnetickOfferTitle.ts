/* eslint-disable no-useless-constructor */

class OnetickOfferTitle extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const currentOfferItem = this.closest('.onetick-offer-product')
    const atcButton = currentOfferItem?.querySelector('.onetick-upsell-button')

    this.onclick = () => {
      const currentVariantId = atcButton?.getAttribute('data-variant-id')
      if (!currentVariantId) return ''

      window.open(`/variants/${currentVariantId}`, '_self')
    }
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-offer-title') || customElements.define('onetick-offer-title', OnetickOfferTitle)
