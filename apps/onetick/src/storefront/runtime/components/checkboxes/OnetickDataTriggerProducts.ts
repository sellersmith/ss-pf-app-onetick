/* eslint-disable no-useless-constructor */

class OnetickDataTriggerProducts extends HTMLElement {
  constructor() {
    super()
  }

  init() {
    const dataTriggerProducts = this.innerText
    window.__onetick_store__ = window.__onetick_store__ || {}
    window.__onetick_store__['triggerProducts'] = JSON.parse(dataTriggerProducts)
    this.remove()
  }

  connectedCallback() {
    this.init()
  }
}

customElements.get('onetick-data-trigger-products')
  || customElements.define('onetick-data-trigger-products', OnetickDataTriggerProducts)
