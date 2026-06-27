// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import { ONETICK_ORDER_PROPERTY_KEYS } from './cart-intent'

const lastFetchedCartProducts: { items: any[] } = { items: [] }
let isFetching = false
let queueCallbacks: Array<(cart: any) => unknown> = []

function cartItemsSignature(items: any[] = []) {
  return JSON.stringify(items
    .map(item => ({
      id: item.id,
      onetickProperties: item.properties?.[ONETICK_ORDER_PROPERTY_KEYS.properties] || null,
    }))
    .sort((a, b) => `${a.id}:${a.onetickProperties}`.localeCompare(`${b.id}:${b.onetickProperties}`)))
}

export function observeOneTickCartChanges(windowRef: Window, handler: (cart: any) => unknown) {
  const PerformanceObserverCtor = (windowRef as any).PerformanceObserver
  if (!PerformanceObserverCtor || typeof handler !== 'function') return function disconnect() {}

  const cartObserver = new PerformanceObserverCtor(async (list: any) => {
    const isCartChanged = list.getEntries().some((entry: any) =>
      ['xmlhttprequest', 'fetch'].includes(entry.initiatorType) && /\/cart\/(change|add|update|clear)/.test(entry.name)
    )
    if (!isCartChanged) return

    queueCallbacks.push(handler)
    if (isFetching) return
    isFetching = true

    try {
      const rootPath = (windowRef as any).Shopify?.routes?.root || '/'
      const data = await windowRef.fetch(`${rootPath}cart.js`).then(response => response.json())
      if (cartItemsSignature(lastFetchedCartProducts.items) !== cartItemsSignature(data?.items || [])) {
        lastFetchedCartProducts.items = data?.items || []
        await Promise.allSettled(queueCallbacks.map(callback => callback(data)))
      }
    } catch (error) {
      console.error(error)
    } finally {
      queueCallbacks = []
      isFetching = false
    }
  })

  cartObserver.observe({ entryTypes: ['resource'] })
  return function disconnect() {
    cartObserver.disconnect()
  }
}
