// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import {
  bootstrapOneTickStore,
  type OneTickRuntimeConfig,
} from './runtime-core'
import { installOneTickCartFetchInterceptor, type InstallOneTickCartFetchInterceptorOptions } from './runtime-fetch-interceptor'
import { installOneTickProductOffersElement } from './runtime-product-offers-element'
import { installOneTickProductOfferClickHandlers } from './runtime-product-offers'
import { installOneTickProductOfferVariantSelector } from './runtime-product-offer-variant-selector'
import { installOneTickProductOfferQuantityHandlers } from './runtime-product-offer-quantity'

export interface InstallOneTickStorefrontRuntimeOptions {
  windowRef?: Window
  documentRef?: Document
  root?: InstallOneTickCartFetchInterceptorOptions['root']
  config?: OneTickRuntimeConfig | null
}

export function installOneTickStorefrontRuntime(options: InstallOneTickStorefrontRuntimeOptions = {}) {
  const windowRef = options.windowRef || window
  const documentRef = options.documentRef || windowRef.document
  const root = options.root || documentRef
  let uninstallCartFetchInterceptor = () => {}
  let uninstallProductOffersElement = () => {}
  let uninstallProductOfferClickHandlers = () => {}
  let uninstallProductOfferVariantSelector = () => {}
  let uninstallProductOfferQuantityHandlers = () => {}

  try {
    bootstrapOneTickStore({
      windowRef,
      documentRef,
      config: options.config,
    })

    uninstallCartFetchInterceptor = installOneTickCartFetchInterceptor({
      windowRef,
      root,
    })
    uninstallProductOffersElement = installOneTickProductOffersElement({
      windowRef,
    })
    uninstallProductOfferVariantSelector = installOneTickProductOfferVariantSelector({
      windowRef,
    })
    uninstallProductOfferClickHandlers = installOneTickProductOfferClickHandlers({
      windowRef,
      root: documentRef,
    })
    uninstallProductOfferQuantityHandlers = installOneTickProductOfferQuantityHandlers({
      windowRef,
      root: documentRef,
    })
  } catch (error) {
    console.error('[OneTick] Storefront runtime failed open during install', error)
    uninstallProductOfferQuantityHandlers()
    uninstallProductOfferClickHandlers()
    uninstallProductOfferVariantSelector()
    uninstallProductOffersElement()
    uninstallCartFetchInterceptor()
    return function uninstall() {}
  }

  return function uninstall() {
    uninstallProductOfferQuantityHandlers()
    uninstallProductOfferClickHandlers()
    uninstallProductOfferVariantSelector()
    uninstallProductOffersElement()
    uninstallCartFetchInterceptor()
  }
}
