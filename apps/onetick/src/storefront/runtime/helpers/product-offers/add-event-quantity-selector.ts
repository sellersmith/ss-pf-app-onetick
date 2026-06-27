export function addEventForQuantitySelector(container: Element) {
  const quantitySelectors = container.querySelectorAll('.onetick-quantity-selector')
  quantitySelectors.forEach((quantitySelector: any) =>
    quantitySelector.addEventListener(
      'change',
      (e: any) => {
        e.stopPropagation()
        e.stopImmediatePropagation()
        const newValue = parseInt((e.target as any)?.value || 0)
        if (newValue < 1) {
          ;(quantitySelector as any).value = '1'
        }
        ;(quantitySelector as any).value = ((e.target as any)?.value || 1).toString()
      },
      true
    )
  )
}
