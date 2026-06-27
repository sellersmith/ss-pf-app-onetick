/* eslint-disable no-useless-constructor */

import { EDynamicFields, EPubSubEvents } from '../../constants'
import { subscribe } from '../../utils/pubsub'

const { PRICE, PRODUCT_TITLE, VARIANT_NAME, COMPARE_AT_PRICE } = EDynamicFields

/**
 * Handles dynamic field updates based on changes in associated OnetickCheckbox elements.
 */
export default class OnetickTextContainer extends HTMLElement {
  private _onetickCheckboxElement: any
  private domString: string

  constructor() {
    super()
    this.domString = this.innerHTML
  }

  set onetickCheckboxElement(val: Element | null) {
    this._onetickCheckboxElement = val
    this.updateDynamicField()
  }

  init() {
    /*
     * We need to wait for the web-component onetick-group-checkboxes defined first
     * Because addonVariants is initialized before onetick-group-checkboxes defined
     */
    customElements.whenDefined('onetick-group-checkboxes').then(this.updateDynamicField)

    /*
     * Subscribe to EPubSubEvents.UPDATE_VARIANT_IN_CHECKBOX event,
     * it will trigger when changing variants in selector
     */
    subscribe(EPubSubEvents.UPDATE_VARIANT_IN_CHECKBOX, this.updateDynamicField)
  }

  updateVariantDynamicField = () => {
    let newDom = this.domString
    const onetickCheckbox = this._onetickCheckboxElement || this.closest('onetick-checkbox')

    if (!onetickCheckbox) return

    const onetickVariantSelector = onetickCheckbox.querySelector('onetick-variant-selector')
    const variantTitleElement = onetickVariantSelector?.querySelector('#onetick-addon-variant')
    const addOnVariantId
      = variantTitleElement?.getAttribute('data-addon-variant-id')
      || onetickCheckbox?.getAttribute('data-upsell-variant-id')

    const { addonVariants } = window.__onetick_store__
    const selectedVariant = addonVariants?.[addOnVariantId]

    if (!selectedVariant) return

    const variantPriceText = selectedVariant.addonVariantPrice || ''
    const variantComparedPriceText = selectedVariant.addonVariantComparedPrice || ''
    const variantTitle = selectedVariant.title || ''
    const productTitle = selectedVariant.product?.title || ''

    newDom = newDom
      .replace(new RegExp(PRICE, 'g'), variantPriceText)
      .replace(new RegExp(COMPARE_AT_PRICE, 'g'), variantComparedPriceText)
      .replace(new RegExp(VARIANT_NAME, 'g'), variantTitle)
      .replace(new RegExp(PRODUCT_TITLE, 'g'), productTitle)

    this.innerHTML = newDom
  }

  updateDynamicField = () => {
    this.updateVariantDynamicField()
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-text-container') || customElements.define('onetick-text-container', OnetickTextContainer)
