import formatCurrency from '../../utils/format-currency'
import observeCartChanges from '../../utils/observe-cart-changes'

/* eslint-disable no-useless-constructor */
class OnetickFreeShippingBar extends HTMLElement {
  disconnectPerformanceObserver: null | (() => void)
  constructor() {
    super()
    this.disconnectPerformanceObserver = null
  }

  init() {
    this.updateProgressBar()
  }

  async updateProgressBar() {
    const MONEY_AWARDS = 100
    const progressBar = this.querySelector('.onetick-rewards-bar-progress') as HTMLElement
    if (progressBar) {
      const response = await fetch(`${window.Shopify.routes.root}cart.js`)
        .then(res => res.json())
        .catch(e => console.error(e))
      const totalPrice = (response?.items || []).reduce(
        (acc: number, cur: any) => acc + cur.presentment_price * cur.quantity,
        0
      )
      progressBar.setAttribute('data-onetick-total-price', `${totalPrice}`)
      const widthPercentage = (totalPrice / MONEY_AWARDS) * 100
      progressBar.style.width = `${widthPercentage}%`
      const onetickRewardsMessage = this.querySelector('.onetick-rewards-message') as HTMLElement
      const onetickRewardsTierCircle = this.querySelector('.onetick-rewards-tier-circle') as HTMLElement
      if (totalPrice < MONEY_AWARDS) {
        onetickRewardsMessage.innerHTML = `
        <p>You’re <strong>${formatCurrency(
          MONEY_AWARDS - totalPrice,
          window.Shopify.currency.active
        )}</strong><span> away from free shipping.</span></p>`
        onetickRewardsTierCircle.setAttribute(
          'style',
          'background-color: rgb(233, 247, 247); fill: rgb(23, 158, 156); border: 2px solid rgb(23, 158, 156);'
        )
      } else {
        onetickRewardsMessage.innerHTML = '<p>Free shipping unlocked!</p>'
        onetickRewardsTierCircle.setAttribute('style', 'background-color: rgb(23, 158, 156); fill: rgb(233, 247, 247);')
      }
    }

    window.__onetick_store__['cachedProcessBarHTML'] = this.innerHTML
  }

  connectedCallback() {
    this.init()
    const disconnectPerformanceObserver = observeCartChanges(() => this.updateProgressBar())
    this.disconnectPerformanceObserver = disconnectPerformanceObserver
  }

  disconnectedCallback() {
    typeof this.disconnectPerformanceObserver === 'function' && this.disconnectPerformanceObserver()
  }
}
customElements.define('onetick-progress-bar', OnetickFreeShippingBar)
