// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
interface InstallOneTickProductOfferVariantSelectorOptions {
  windowRef?: Window
}

const placeholderSquare = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/placeholder_image_square.png'
const placeholderRect = 'https://cdn.shopify.com/s/files/1/0646/2953/8985/files/placeholder_image_rect.png'

function showButton(button: Element | null, display: 'flex' | 'block' = 'block') {
  if (!button) return
  ;(button as HTMLElement).style.display = display
}

function hideButton(button: Element | null) {
  if (!button) return
  ;(button as HTMLElement).style.display = 'none'
}

function updateImage(selectorElement: HTMLElement, productItem: Element, selectedOption: Element) {
  const productImage = productItem.querySelector('.onetick-offer-item-img')
  if (!productImage) return

  const variantImage = selectedOption.getAttribute('data-variant-img') || ''
  if (variantImage) {
    productImage.setAttribute('src', variantImage)
    return
  }

  const featuredImage = selectorElement.getAttribute('data-featured-image') || ''
  if (featuredImage) {
    productImage.setAttribute('src', featuredImage)
    return
  }

  productImage.setAttribute(
    'src',
    selectorElement.getAttribute('data-horizontal') === 'true' ? placeholderSquare : placeholderRect
  )
}

function handleVariantChange(selectorElement: HTMLElement, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()

  const variantSelect = selectorElement.querySelector('select') as HTMLSelectElement | null
  const selectedValue = (event.target as HTMLSelectElement | null)?.value
  const selectedOption = selectedValue ? variantSelect?.querySelector(`option[value='${selectedValue}']`) : null
  const productItem = selectorElement.closest('.onetick-offer-product')
  if (!selectedOption || !productItem) return

  const addButton = productItem.querySelector('.onetick-upsell-button')
  const soldOutButton = productItem.querySelector('.onetick-upsell-button.disable')
  addButton?.setAttribute('data-variant-id', selectedValue)

  const price = productItem.querySelector('.onetick-offer-item-price')
  const comparePrice = productItem.querySelector('.onetick-offer-item-compared-price')
  if (price) price.textContent = selectedOption.getAttribute('data-price') || ''
  if (comparePrice) comparePrice.textContent = selectedOption.getAttribute('data-compared-price') || ''
  updateImage(selectorElement, productItem, selectedOption)

  if (selectedOption.getAttribute('data-available-for-sale') === 'true') {
    showButton(addButton)
    hideButton(soldOutButton)
  } else {
    showButton(soldOutButton)
    hideButton(addButton)
  }
}

export function installOneTickProductOfferVariantSelector(
  options: InstallOneTickProductOfferVariantSelectorOptions = {}
) {
  const windowRef = options.windowRef || window
  const customElementsRegistry = windowRef.customElements
  const HTMLElementCtor = (windowRef as any).HTMLElement
  if (!customElementsRegistry || !HTMLElementCtor) return function uninstall() {}
  if (customElementsRegistry.get('onetick-offer-variant-selector')) return function uninstall() {}

  class OneTickOfferVariantSelector extends HTMLElementCtor {
    connectedCallback() {
      const variantSelect = this.querySelector('select')
      variantSelect?.addEventListener('change', event => handleVariantChange(this as HTMLElement, event), true)
    }
  }

  customElementsRegistry.define('onetick-offer-variant-selector', OneTickOfferVariantSelector)
  return function uninstall() {}
}
