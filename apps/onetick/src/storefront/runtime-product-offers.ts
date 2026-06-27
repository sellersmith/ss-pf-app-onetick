// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { createOneTickProductOfferProperties, type OneTickProductOfferIntent } from './cart-intent'

type OneTickProductOfferRoot = Pick<Document, 'querySelectorAll'> | Pick<HTMLElement, 'querySelectorAll'>
type OneTickProductOfferButton = HTMLElement & {
  getAttribute(name: string): string | null
  setAttribute(name: string, value: string): void
  removeAttribute(name: string): void
}

export interface InstallOneTickProductOfferClickHandlersOptions {
  windowRef?: Window
  root?: OneTickProductOfferRoot
}

function getShopifyRoutesRoot(windowRef: Window): string {
  const root = (windowRef as any).Shopify?.routes?.root
  if (typeof root !== 'string' || !root) return '/'
  return root.endsWith('/') ? root : `${root}/`
}

function getProductOfferIntent(
  windowRef: Window,
  offerElement: Element
): Pick<OneTickProductOfferIntent, 'offerId' | 'placement' | 'masterProductTitle'> {
  const group = offerElement.closest('onetick-product-offers')
  const placement = group?.getAttribute('data-product-offer-placement') === 'product_page' ? 'product_page' : 'cart'
  const masterProduct = windowRef.__onetick_store__?.mainProduct
  const masterProductTitle =
    masterProduct && typeof masterProduct === 'object' && 'title' in masterProduct
      ? String(masterProduct.title || '')
      : ''

  return {
    offerId: group?.getAttribute('data-product-offer-id') || '',
    placement,
    masterProductTitle,
  }
}

function getOfferQuantity(offerElement: Element): number {
  const rawValue = (offerElement.querySelector('.onetick-quantity-selector') as HTMLInputElement | null)?.value
  const quantity = Number(rawValue || 1)
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

async function readJsonResponse(response: Response): Promise<unknown | null> {
  try {
    const responseWithBody = typeof response.clone === 'function' ? response.clone() : response
    return typeof responseWithBody.json === 'function' ? responseWithBody.json() : null
  } catch {
    return null
  }
}

async function addProductOfferToCart(
  windowRef: Window,
  offerElement: Element,
  button: OneTickProductOfferButton
) {
  const variantId = button.getAttribute('data-variant-id')
  if (!variantId) return

  const intent = getProductOfferIntent(windowRef, offerElement)
  const response = await windowRef.fetch(`${getShopifyRoutesRoot(windowRef)}cart/add.js`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    __onetickHandlesCartUpdate: true,
    body: JSON.stringify({
      items: [
        {
          id: variantId,
          quantity: getOfferQuantity(offerElement),
          properties: createOneTickProductOfferProperties(intent),
        },
      ],
    }),
  } as RequestInit)
  const handleUpdateCartAfterATC = windowRef.__onetick_store__?.handleUpdateCartAfterATC
  if (!response.ok || typeof handleUpdateCartAfterATC !== 'function') return
  const addedItem = await readJsonResponse(response)
  if (!addedItem) return
  const cartResponse = await windowRef.fetch(`${getShopifyRoutesRoot(windowRef)}cart.js`)
  await handleUpdateCartAfterATC(addedItem, await readJsonResponse(cartResponse))
}

export function installOneTickProductOfferClickHandlers(
  options: InstallOneTickProductOfferClickHandlersOptions = {}
) {
  const windowRef = options.windowRef || window
  const root = options.root || windowRef.document
  if (typeof root.querySelectorAll !== 'function') return function uninstall() {}

  const listeners: Array<{ button: OneTickProductOfferButton; listener: EventListener }> = []
  const bindOfferElements = () => {
    const offerElements = Array.from(root.querySelectorAll('.onetick-offer-product'))

    offerElements.forEach(offerElement => {
      const button = offerElement.querySelector('.onetick-upsell-button') as OneTickProductOfferButton | null
      if (!button || button.getAttribute('data-added-event')) return

      const listener: EventListener = async event => {
        event.preventDefault()
        button.classList.add('loading')
        try {
          await addProductOfferToCart(windowRef, offerElement, button)
        } catch (error) {
          console.error('[OneTick] Failed to add product offer', error)
        } finally {
          button.classList.remove('loading')
        }
      }

      button.setAttribute('data-added-event', 'true')
      button.addEventListener('click', listener)
      listeners.push({ button, listener })
    })
  }

  bindOfferElements()

  const observer =
    typeof windowRef.MutationObserver === 'function'
      ? new windowRef.MutationObserver(() => bindOfferElements())
      : null
  observer?.observe(root as Node, { childList: true, subtree: true })

  return function uninstall() {
    observer?.disconnect()
    listeners.forEach(({ button, listener }) => {
      button.removeEventListener('click', listener)
      button.removeAttribute('data-added-event')
    })
  }
}
