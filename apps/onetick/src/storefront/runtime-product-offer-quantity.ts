// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
type ProductOfferQuantityRoot = Pick<Document, 'querySelectorAll'> | Pick<HTMLElement, 'querySelectorAll'>
type ProductOfferQuantityInput = HTMLInputElement & {
  addEventListener(type: string, listener: EventListener, options?: boolean): void
  removeEventListener(type: string, listener: EventListener, options?: boolean): void
}

interface InstallOneTickProductOfferQuantityHandlersOptions {
  windowRef?: Window
  root?: ProductOfferQuantityRoot
}

function parseNumber(value: string | number | null | undefined, fallback: number) {
  const number = parseInt(String(value ?? ''), 10)
  return Number.isFinite(number) ? number : fallback
}

function changeQuantity(input: ProductOfferQuantityInput, delta: number) {
  const min = parseNumber(input.min, 0)
  const max = parseNumber(input.max, Infinity)
  const nextValue = parseNumber(input.value, 0) + delta
  if (nextValue >= min && nextValue <= max) input.value = nextValue.toString()
}

function clampQuantityInput(input: ProductOfferQuantityInput, event: Event) {
  event.stopPropagation()
  event.stopImmediatePropagation()
  if (parseNumber((event.target as HTMLInputElement | null)?.value, 0) < 1) input.value = '1'
  input.value = (input.value || '1').toString()
}

export function installOneTickProductOfferQuantityHandlers(
  options: InstallOneTickProductOfferQuantityHandlersOptions = {}
) {
  const windowRef = options.windowRef || window
  const root = options.root || windowRef.document
  if (typeof root.querySelectorAll !== 'function') return function uninstall() {}

  const listeners: Array<{ element: Element; type: string; listener: EventListener; options?: boolean }> = []
  const bindOfferElements = () => {
    const offerElements = Array.from(root.querySelectorAll('.onetick-offer-product'))
    offerElements.forEach(offerElement => {
      if (offerElement.getAttribute('data-quantity-event')) return
      const input = offerElement.querySelector('.onetick-quantity-selector') as ProductOfferQuantityInput | null
      if (!input) return

      const addButton = offerElement.querySelector('.qty-btn.qty-add')
      const removeButton = offerElement.querySelector('.qty-btn.qty-rem')
      const onAdd: EventListener = () => changeQuantity(input, 1)
      const onRemove: EventListener = () => changeQuantity(input, -1)
      const onChange: EventListener = event => clampQuantityInput(input, event)

      addButton?.addEventListener('click', onAdd)
      removeButton?.addEventListener('click', onRemove)
      input.addEventListener('change', onChange, true)
      offerElement.setAttribute('data-quantity-event', 'true')

      addButton && listeners.push({ element: addButton, type: 'click', listener: onAdd })
      removeButton && listeners.push({ element: removeButton, type: 'click', listener: onRemove })
      listeners.push({ element: input, type: 'change', listener: onChange, options: true })
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
    listeners.forEach(({ element, type, listener, options }) => element.removeEventListener(type, listener, options))
    Array.from(root.querySelectorAll('.onetick-offer-product')).forEach(offerElement =>
      offerElement.removeAttribute('data-quantity-event')
    )
  }
}
