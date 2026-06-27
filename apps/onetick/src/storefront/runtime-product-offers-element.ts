// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import type { OneTickUnknownRecord } from './runtime-types'
import { observeOneTickCartChanges } from './runtime-observe-cart-changes'
import { resolveSpecificProductOfferRecommendations, type OneTickProductOfferProduct } from './runtime-product-offers-direct'
import { installOneTickProductOfferSliderNavigation } from './runtime-product-offers-slider-navigation'
import {
  getOneTickProductOfferDisplayType,
  getOneTickProductOfferStyleVariables,
  getOneTickProductOfferStyling,
} from './runtime-product-offers-styling'

type OneTickProductOfferPlacement = 'cart' | 'product_page'

interface OneTickProductOfferMetafield {
  id?: string; h?: string; pl?: OneTickProductOfferPlacement; isDraft?: boolean; dt?: 'slider' | 'block'
  bt?: string; ec?: boolean; eo?: boolean; eq?: boolean; l?: boolean; max?: number
}

interface InstallOneTickProductOffersElementOptions {
  windowRef?: Window
}

const noOfferMessage = 'No product offer match with conditions'
const placeholderSquare = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/placeholder_image_square.png'

function activeProductOffers(windowRef: Window): OneTickProductOfferMetafield[] {
  const productOffers = (windowRef.__onetick_store__?.productOffers || {}) as Record<string, OneTickUnknownRecord>
  return Object.values(productOffers).filter(offer => !offer.isDraft) as OneTickProductOfferMetafield[]
}

function getPlacement(element: HTMLElement): OneTickProductOfferPlacement {
  return element.getAttribute('data-trigger-product-id') ? 'product_page' : 'cart'
}

function findProductOffer(windowRef: Window, placement: OneTickProductOfferPlacement) {
  return activeProductOffers(windowRef).find(offer => (placement === 'cart' ? !offer.pl || offer.pl === 'cart' : offer.pl === placement))
}

function renderSliderShell(styleVariables: string) {
  return `<onetick-product-offers style="${escapeHtml(styleVariables)}"><h3 class="onetick-product-offers-title" style="font-weight: 650;"></h3>
  <div class="onetick-offer-container"><div class="onetick-loading-overlay"></div><div class="onetick-slider-items"></div><button type="button" aria-label="previous slide" class="control-arrow control-prev"></button><button type="button" aria-label="next slide" class="control-arrow control-next"></button></div></onetick-product-offers>`
}

function renderGridShell(styleVariables: string) {
  return `<onetick-product-offers style="${escapeHtml(styleVariables)}"><h2 class="onetick-product-offers-title" style="font-weight: 650;"></h2><div class="onetick-offer-container"><div class="onetick-loading-overlay"></div><div class="onetick-grid-items"></div></div></onetick-product-offers>`
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char))
}

function formatShopifyMoney(windowRef: Window, amount?: string | null) {
  if (!amount) return ''
  const number = Number(amount)
  if (Number.isNaN(number)) return ''
  const format = windowRef.__onetick_store__?.money_format || '${{amount}}'
  const value = number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return format.replace(/{{\s*amount\s*}}/, value)
}

function renderVariantSelector(windowRef: Window, product: OneTickProductOfferProduct, variants: OneTickProductOfferProduct['variants']) {
  if (variants.length <= 1) return ''
  const options = variants.map((variant, index) => `<option value='${variant.id}' name='${escapeHtml(variant.title)}'
    data-price='${escapeHtml(formatShopifyMoney(windowRef, variant.price?.amount))}'
    data-compared-price='${escapeHtml(formatShopifyMoney(windowRef, variant.compareAtPrice?.amount))}'
    data-available-for-sale='${!!variant.availableForSale}' ${index === 0 ? 'selected' : ''}
    data-variant-img='${escapeHtml(variant.image?.url || '')}'>${escapeHtml(variant.title)}</option>`).join('')
  return `<onetick-offer-variant-selector data-featured-image='${escapeHtml(product.featuredImage?.url || '')}' data-horizontal='true'>
    <select autocomplete="off">${options}</select>
  </onetick-offer-variant-selector>`
}

function renderProductOfferProduct(windowRef: Window, product: OneTickProductOfferProduct, productOffer: OneTickProductOfferMetafield) {
  if (!product.availableForSale && productOffer.eo) return ''
  const variants = (productOffer.eo ? product.variants.filter(variant => variant.availableForSale) : product.variants)
    .sort((a, b) => (b.availableForSale === a.availableForSale ? 0 : a.availableForSale ? -1 : 1))
  const firstVariant = variants[0]
  if (!firstVariant) return ''
  const imageUrl = firstVariant.image?.url || product.featuredImage?.url || placeholderSquare
  const price = formatShopifyMoney(windowRef, firstVariant.price?.amount)
  const compareAtPrice = formatShopifyMoney(windowRef, firstVariant.compareAtPrice?.amount)

  return `<div class="onetick-offer-container-item onetick-offer-product onetick-flex-row" data-product-id="${escapeHtml(product.id)}">
    <div class="onetick-loading-overlay"></div>
    <img class="onetick-offer-item-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.featuredImage?.altText || '')}"/>
    <div class="onetick-offer-item-info">
      <div class="onetick-offer-item-header">
        <onetick-offer-title><h5 class="onetick-offer-item-title">${escapeHtml(product.title)}</h5></onetick-offer-title>
        <div class="onetick-offer-item-price-row">
          <span class="onetick-offer-item-price">${escapeHtml(price)}</span>
          <span class="onetick-offer-item-compared-price">${escapeHtml(compareAtPrice)}</span>
        </div>
      </div>
      <div class="onetick-offer-item-content">
        <div class="onetick-d-flex onetick-g-8">
          ${renderVariantSelector(windowRef, product, variants)}
          ${productOffer.eq ? '<div class="numberstyle-qty"><button class="qty-btn qty-rem">-</button><input type="number" step="1" class="onetick-quantity-selector" min="1" value="1"/><button class="qty-btn qty-add">+</button></div>' : ''}
        </div>
        <div class="onetick-upsell-button" data-variant-id=${firstVariant.id} style='display: ${firstVariant.availableForSale ? 'block' : 'none'}'>${escapeHtml(productOffer.bt || 'Add')}</div>
        <div class="onetick-upsell-button disable" data-variant-id=${firstVariant.id} style='display: ${firstVariant.availableForSale ? 'none' : 'block'}'>Sold out</div>
      </div>
    </div>
  </div>`
}

function showBannerWarning(element: HTMLElement, message: string) {
  const warningBanner = element.parentNode?.querySelector('.onetick-warning-banner') as HTMLElement | null
  const warningDescription = warningBanner?.querySelector('.onetick-warning-description') as HTMLElement | null
  if (!warningBanner || !warningDescription) return

  warningBanner.style.display = 'block'
  warningDescription.innerHTML = message
}

function getTriggerProductIds(element: HTMLElement, windowRef: Window): string[] {
  const triggerProductId = element.getAttribute('data-trigger-product-id')
  if (triggerProductId) return [triggerProductId]
  const cartItems = (windowRef.__onetick_store__?.cartOrder?.items || []) as OneTickUnknownRecord[]
  return cartItems.map(item => item.product_id || item.product?.id).filter(Boolean).map(String)
}

// Hydrates direct offer recommendations on the client because product-offer conditions depend on
// current cart/PDP trigger products and Storefront API availability.
async function hydrateSpecificProducts(element: HTMLElement, windowRef: Window, productOffer: OneTickProductOfferMetafield, displayType: 'slider' | 'block') {
  const triggerProductIds = getTriggerProductIds(element, windowRef)
  if (!triggerProductIds.length || !productOffer.id) return
  const products = await resolveSpecificProductOfferRecommendations({
    windowRef,
    productOfferId: productOffer.id,
    triggerProductIds,
    country: (windowRef as any).Shopify?.country || 'US',
  })
  const styling = getOneTickProductOfferStyling(windowRef, displayType)
  const limit = styling.idn || (productOffer.l ? productOffer.max : 250)
  const cartItems = (windowRef.__onetick_store__?.cartOrder?.items || []) as OneTickUnknownRecord[]
  const cartProductIds = new Set(cartItems.map(item => item.product_id || item.product?.id).filter(Boolean).map(String))
  const oneTickProductIds = new Set(cartItems.filter(item => item.properties?.__onetick_properties).map(item => item.product_id || item.product?.id).filter(Boolean).map(String))
  const displayProducts = [...new Map(products.map(product => [product.id, product])).values()]
    .filter(product => !oneTickProductIds.has(product.id))
    .filter(product => !productOffer.ec || !cartProductIds.has(product.id))
    .slice(0, limit)
    .sort((a, b) => (b.availableForSale === a.availableForSale ? 0 : a.availableForSale ? -1 : 1))
  if (!displayProducts.length) return void (element.innerHTML = '')
  const html = displayProducts.map(product => renderProductOfferProduct(windowRef, product, productOffer)).join('')
  const container = element.querySelector(displayType === 'block' ? '.onetick-grid-items' : '.onetick-slider-items') as HTMLElement | null
  if (container) { container.innerHTML = html; if (displayType === 'slider') installOneTickProductOfferSliderNavigation(element, windowRef) }
}

async function renderProductOffersShell(element: HTMLElement, windowRef: Window) {
  const placement = getPlacement(element)
  const productOffer = findProductOffer(windowRef, placement)

  if (!productOffer) {
    element.innerHTML = ''
    showBannerWarning(element, noOfferMessage)
    return
  }

  const displayType = getOneTickProductOfferDisplayType(windowRef, productOffer)
  const styleVariables = getOneTickProductOfferStyleVariables(windowRef)
  element.innerHTML = displayType === 'block' ? renderGridShell(styleVariables) : renderSliderShell(styleVariables)

  const offerRoot = element.querySelector('onetick-product-offers')
  offerRoot?.setAttribute('data-product-offer-id', productOffer.id || '')
  offerRoot?.setAttribute('data-product-offer-placement', placement)

  const heading = element.querySelector('.onetick-product-offers-title')
  if (heading) {
    heading.textContent = productOffer.h || ''
    ;(heading as HTMLElement).classList.add('show')
  }

  await hydrateSpecificProducts(element, windowRef, productOffer, displayType)
}

export function installOneTickProductOffersElement(options: InstallOneTickProductOffersElementOptions = {}) {
  const windowRef = options.windowRef || window
  const customElementsRegistry = windowRef.customElements
  const HTMLElementCtor = (windowRef as any).HTMLElement
  if (!customElementsRegistry || !HTMLElementCtor) return function uninstall() {}
  if (customElementsRegistry.get('onetick-product-offers-group')) return function uninstall() {}

  class OneTickProductOffersGroup extends HTMLElementCtor {
    private disconnectCartObserver?: () => void
    connectedCallback() {
      this.disconnectCartObserver ||= observeOneTickCartChanges(windowRef, cart => {
        windowRef.__onetick_store__ = { ...(windowRef.__onetick_store__ || {}), cartOrder: cart }
        return renderProductOffersShell(this as HTMLElement, windowRef)
      })
      return renderProductOffersShell(this as HTMLElement, windowRef)
    }
    disconnectedCallback() { this.disconnectCartObserver?.() }
  }
  customElementsRegistry.define('onetick-product-offers-group', OneTickProductOffersGroup)
  return function uninstall() {}
}
