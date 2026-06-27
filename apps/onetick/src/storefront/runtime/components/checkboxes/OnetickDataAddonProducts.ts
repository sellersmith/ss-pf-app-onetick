/* eslint-disable no-useless-constructor */

class OnetickDataAddonProducts extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const dataAddonVariants = this.innerText
    window.__onetick_store__ = window.__onetick_store__ || {}
    window.__onetick_store__['addonVariants'] = JSON.parse(dataAddonVariants)
    this.remove()
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-data-addon-products')
  || customElements.define('onetick-data-addon-products', OnetickDataAddonProducts)
