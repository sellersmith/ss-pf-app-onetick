/* eslint-disable no-useless-constructor */

import { EPubSubEvents } from '../../constants'
import { publish } from '../../utils/pubsub'

class OnetickVariantSelector extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const variantSelectElement = this.querySelector('select')
    if (!variantSelectElement) return

    variantSelectElement.addEventListener('change', (e: Event) => {
      e.stopImmediatePropagation()
      e.preventDefault()
      e.stopPropagation()
      // Get the id and name of selected variant from hidden <select> tag
      const selectedAddonVariantId = (e.target as any).value
      const selectedAddonVariantName
        = variantSelectElement.querySelector(`option[value='${selectedAddonVariantId}']`)?.getAttribute('name') || ''

      this.handleUpdateVariantTitleAndPrice({ selectedAddonVariantId, selectedAddonVariantName })
    })

    // Prevent clicking checkbox event
    variantSelectElement.addEventListener('click', e => {
      e.stopImmediatePropagation()
      e.preventDefault()
      e.stopPropagation()
    })
  }

  handleUpdateVariantTitleAndPrice({
    selectedAddonVariantId,
    selectedAddonVariantName,
  }: {
    selectedAddonVariantId: string
    selectedAddonVariantName: string
  }) {
    // Update the title and id of the selected variant to onetick-addon-variant
    const variantTitleElement = this.querySelector('#onetick-addon-variant')
    if (!variantTitleElement) return

    variantTitleElement.setAttribute('data-addon-variant-id', selectedAddonVariantId)
    variantTitleElement.textContent = selectedAddonVariantName

    // Update price and compared price
    const currentCheckboxElement = this.closest('onetick-checkbox')
    if (!currentCheckboxElement) return

    currentCheckboxElement.setAttribute('data-upsell-variant-id', selectedAddonVariantId)

    const variantPriceElement = currentCheckboxElement.querySelector('.onetick-price')
    const variantComparedPriceElement = currentCheckboxElement.querySelector('.onetick-compared-price')

    const { addonVariants } = window.__onetick_store__

    const variantPriceText = addonVariants[selectedAddonVariantId].addonVariantPrice
    const variantComparedPriceText = addonVariants[selectedAddonVariantId].addonVariantComparedPrice

    if (variantPriceElement) {
      variantPriceElement.innerHTML = variantPriceText
    }

    if (variantComparedPriceElement) {
      variantComparedPriceElement.innerHTML = variantComparedPriceText
    }

    // Publish event to update dynamic text in OnetickTextContainer
    publish(EPubSubEvents.UPDATE_VARIANT_IN_CHECKBOX)
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-variant-selector')
  || customElements.define('onetick-variant-selector', OnetickVariantSelector)
