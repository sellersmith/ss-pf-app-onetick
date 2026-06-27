// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
export function createOneTickPubSub() {
  const subscribers: Record<string, Array<(data?: unknown) => void>> = {}

  return {
    subscribe(eventName: string, callback: (data?: unknown) => void) {
      subscribers[eventName] = [...(subscribers[eventName] || []), callback]
      return function unsubscribe() {
        subscribers[eventName] = (subscribers[eventName] || []).filter(cb => cb !== callback)
      }
    },
    publish(eventName: string, data?: unknown) {
      ;(subscribers[eventName] || []).forEach(callback => callback(data))
    },
  }
}
