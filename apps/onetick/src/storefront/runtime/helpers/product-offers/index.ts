import { cachedProductOffersHTML } from '../../components/product-offers/store'
import {
  EHtmlSelectors,
  EMediaRatioOptions,
  EPlacementType,
  EProductOffersDisplayType,
  EMediaFit,
} from '../../constants'
import type { IProductOfferMetafieldData } from '../../types'

export function handleInjectProductOfferToCartDrawer(cartDrawer: HTMLElement, productOfferWidgetId: string) {
  const isExistProductOffer = cartDrawer?.parentNode?.querySelector('onetick-product-offers-group')
  if (isExistProductOffer && isExistProductOffer.getAttribute('data-drawer-cart') === 'true') {
    return
  }

  const productOfferCartDrawer = document.createElement('onetick-product-offers-group')
  productOfferCartDrawer.setAttribute('data-allow-cached', 'true')
  productOfferCartDrawer.setAttribute('data-drawer-cart', 'true')
  productOfferCartDrawer.setAttribute('id', productOfferWidgetId)
  productOfferCartDrawer.classList.add('loading')

  const cachedHTML = cachedProductOffersHTML.get(productOfferWidgetId)
  cachedHTML && (productOfferCartDrawer.innerHTML = cachedHTML)

  cartDrawer.appendChild(productOfferCartDrawer)
}

export const getAllActiveProductOffers = (): IProductOfferMetafieldData[] => {
  const productOffers = Object.values(window.__onetick_store__.productOffers || {}) as IProductOfferMetafieldData[]

  return productOffers.filter(productOffers => !productOffers.isDraft)
}

export const getProductOfferPlacement = (productOffer: IProductOfferMetafieldData): EPlacementType => {
  return (productOffer.pl as EPlacementType) || EPlacementType.CART
}

export const getDisplayTypeFromOldProductOffer = (): EProductOffersDisplayType | void => {
  const allProductOffers = getAllActiveProductOffers()

  for (const productOffer of allProductOffers) {
    if (productOffer.dt) return productOffer.dt as EProductOffersDisplayType
  }
}

export const getProductOfferStylingAndAppendToStyle = () => {
  const productOffersStyling = window.__onetick_store__?.productOffersStyling
  if (!productOffersStyling) return ''

  // Utility function for adding 'px' to a value if it's a number
  const addPxIfNumber = (value: number | string): string => (typeof value === 'number' ? `${value}px` : value)

  // Media ratio mapping
  const mappingMediaRatio: Record<EMediaRatioOptions, string> = {
    [EMediaRatioOptions.SQUARE]: '1/1',
    [EMediaRatioOptions.PORTRAIT]: '3/4',
  }

  // Media ratio mapping
  const mappingMediaFit: Record<EMediaFit, string> = {
    [EMediaFit.ORIGINAL]: 'contain',
    [EMediaFit.FILL]: 'cover',
  }

  const { c, br, mr, mf } = productOffersStyling

  const { ptc, ppc, ppcc, bbgc, btc } = c || {}
  const { mbr, sbr, bbr } = br || {}
  // Build CSS variable strings dynamically
  const cssVariables = [
    ['po-ptc', ptc],
    ['po-ppc', ppc],
    ['po-ppcc', ppcc],
    ['po-bbgc', bbgc],
    ['po-btc', btc],
    ['po-mbr', addPxIfNumber(mbr)],
    ['po-sbr', addPxIfNumber(sbr)],
    ['po-bbr', addPxIfNumber(bbr)],
    ['po-mr', mappingMediaRatio[mr as EMediaRatioOptions] || '1/1'],
    ['po-mf', mappingMediaFit[mf as EMediaFit] || 'contain'],
  ]
    .map(([key, value]) => (value ? `--${key}: ${value};` : ''))
    .join(' ')

  return cssVariables
}

export const getProductOfferDisplayType = (): EProductOffersDisplayType => {
  if (window.__onetick_store__?.productOffersStyling?.dt) {
    return window.__onetick_store__?.productOffersStyling?.dt
  }

  const displayTypeFromOldProductOffer = getDisplayTypeFromOldProductOffer()
  if (displayTypeFromOldProductOffer) return displayTypeFromOldProductOffer

  return EProductOffersDisplayType.SLIDER
}

export const hasProductOfferForCartPage = (): boolean => {
  const allProductOffers = getAllActiveProductOffers()
  const productOfferForCartPage = allProductOffers.filter(
    productOffer => !productOffer.pl || productOffer.pl === EPlacementType.CART
  )
  return !!productOfferForCartPage.length
}

export const hasProductOfferForCartDrawer = (): boolean => {
  const allProductOffers = getAllActiveProductOffers()
  const productOfferForCartDrawer = allProductOffers.filter(
    productOffer => (!productOffer.pl || productOffer.pl === EPlacementType.CART) && !productOffer.hc
  )
  return !!productOfferForCartDrawer.length
}

export const getCustomSelectorFromOldProductOffer = (): string | void => {
  const allProductOffers = getAllActiveProductOffers()

  for (const productOffer of allProductOffers) {
    if (productOffer.cs) return productOffer.cs
  }
}

export const getProductOfferCustomSelector = () => {
  if (window.__onetick_store__?.custom_selector) {
    return window.__onetick_store__?.custom_selector
  }

  const customSelectorFromOldProductOffer = getCustomSelectorFromOldProductOffer()
  if (customSelectorFromOldProductOffer) {
    return customSelectorFromOldProductOffer
  }

  return EHtmlSelectors.CART_DRAWER_ITEMS
}
