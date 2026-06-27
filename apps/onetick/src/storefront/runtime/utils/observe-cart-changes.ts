import { EOneTickOrderPropertyKeys } from '../constants'

export const lastFetchedCartProducts: any = { items: [] }
let isFetching: boolean = false
let queueCallbacks: Function[] = []

export default function observeCartChanges(handler: Function) {
  const cartObserver = new PerformanceObserver(list => {
    const isCartChanged = list.getEntries().filter((entry: any) => {
      const isValidRequestType = ['xmlhttprequest', 'fetch'].includes(entry.initiatorType)
      const isCartChangeRequest = /\/cart\/(change|add|update|clear)/.test(entry.name)
      return isValidRequestType && isCartChangeRequest
    })

    if (isCartChanged?.length && typeof handler === 'function') {
      // Push the handlers to a queue so that we only need to fetch cart.js one time.
      queueCallbacks.push(handler)
      // Prevent handling another request if the earlier request is still in progress
      if (isFetching) return
      isFetching = true

      fetch(`${window.Shopify.routes.root}cart.js`)
        .then(res => res.json())
        .then(data => {
          // Only update the product offers list when cart items change
          const lastFetchedProductsWithOneTickFlag = (
            lastFetchedCartProducts?.items?.length
              ? lastFetchedCartProducts.items.map((item: any) => ({
                  id: item.id,
                  onetickProperties: item.properties[EOneTickOrderPropertyKeys.ONETICK_PROPERTIES] || null,
                }))
              : []
          ).sort()

          const currentProductsWithOneTickFlag = (
            data?.items?.length
              ? data.items.map((item: any) => ({
                  id: item.id,
                  onetickProperties: item.properties[EOneTickOrderPropertyKeys.ONETICK_PROPERTIES] || null,
                }))
              : []
          ).sort()

          if (JSON.stringify(lastFetchedProductsWithOneTickFlag) !== JSON.stringify(currentProductsWithOneTickFlag)) {
            // Cache the latest cart items
            lastFetchedCartProducts['items'] = data?.items || []
            Promise.allSettled(queueCallbacks.map(callback => callback(data)))
          }
        })
        .catch(e => console.error(e))
        .finally(() => {
          queueCallbacks = []
          isFetching = false
        })
    }
  })
  cartObserver.observe({ entryTypes: ['resource'] })

  return () => cartObserver.disconnect()
}
