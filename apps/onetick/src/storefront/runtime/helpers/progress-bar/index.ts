import { EHtmlSelectors } from '../../constants'
import { observeDOM } from '../../utils/observe-dom'
import { uuid } from '../../utils/unique-id'
import { handleInjectCheckboxToCartDrawer } from '../checkboxes'
import { addAddOnToFormATC } from '../checkboxes/add-addon-to-atc-form'
import { getProductOfferCustomSelector, handleInjectProductOfferToCartDrawer } from '../product-offers'

export function handleObserveCartDrawerUpdateWithCheckbox() {
  const { custom_selector } = window.__onetick_store__

  const cartDrawerSelectorOfCheckboxes = custom_selector || EHtmlSelectors.CART_DRAWER_ITEMS

  const cartDrawerSelectorOfCheckboxElements = Array.from(document.querySelectorAll(cartDrawerSelectorOfCheckboxes))

  cartDrawerSelectorOfCheckboxElements.forEach(cartDrawerSelectorOfCheckboxElement => {
    if (cartDrawerSelectorOfCheckboxElement?.parentNode) {
      handleInjectCheckboxToCartDrawer(cartDrawerSelectorOfCheckboxElement)
    }

    const cartDrawerWrapperElement
      = cartDrawerSelectorOfCheckboxElement.closest(EHtmlSelectors.CART_DRAWER)
      || cartDrawerSelectorOfCheckboxElement.closest(EHtmlSelectors.SECTION)
      || document.body

    observeDOM(cartDrawerWrapperElement, () => {
      const newCartDrawerSelectorOfCheckboxElement
        = cartDrawerWrapperElement.querySelector(cartDrawerSelectorOfCheckboxes)

      handleInjectCheckboxToCartDrawer(newCartDrawerSelectorOfCheckboxElement)
    })
  })
}

export function handleObserveCartDrawerUpdate() {
  // We need to cached the process bar HTML to restore when it is removed by theme
  // window.__onetick_store__['cachedProcessBarHTML'] = defaultProgressBarHTML

  let cartDrawerSelectorOfProductOffersElements: HTMLElement[] = []
  // cartDrawerSelectorOfProgressBar: string,
  // cartDrawerSelectorOfProgressBarElement: HTMLElement | null = null

  // const { progressBar } = window.__onetick_store__

  // Use Custom selector or Default selector to insert the Product Offers is after cart drawer items
  const cartDrawerSelectorOfProductOffers = getProductOfferCustomSelector()
  cartDrawerSelectorOfProductOffersElements = Array.from(document.querySelectorAll(cartDrawerSelectorOfProductOffers))

  cartDrawerSelectorOfProductOffersElements.forEach(cartDrawerSelectorOfProductOffersElement => {
    // if (progressBar) {
    //   // Use Custom selector or Default selector to insert the Progress Bar is after cart drawer heading
    //   cartDrawerSelectorOfProgressBar = progressBar?.cs || EHtmlSelectors.CART_DRAWER_HEADER
    //   cartDrawerSelectorOfProgressBarElement = document.querySelector(cartDrawerSelectorOfProgressBar)
    //   handleInjectProgressBarToCartDrawer(cartDrawerSelectorOfProgressBarElement)
    // }

    // Observe the whole cart drawer to restore the progress bar because it is removed by theme when drawer updates
    // if (cartDrawerSelectorOfProgressBarElement?.parentNode || cartDrawerSelectorOfProductOffersElement?.parentNode) {

    if (cartDrawerSelectorOfProductOffersElement?.parentNode) {
      const productOfferWidgetId = `onetick-${uuid()}`

      /*
       * Get the cart drawer wrapperelement to observe
       * If not found, we will observe changes in document.body
       */
      // const cartDrawerWrapperElement = cartDrawerSelectorOfProgressBarElement
      //   ? cartDrawerSelectorOfProgressBarElement.closest(EHtmlSelectors.CART_DRAWER) ||
      //     cartDrawerSelectorOfProgressBarElement.closest(EHtmlSelectors.SECTION) ||
      //     document.body
      const cartDrawerWrapperElement
        = cartDrawerSelectorOfProductOffersElement.closest(EHtmlSelectors.CART_DRAWER)
        || cartDrawerSelectorOfProductOffersElement.closest(EHtmlSelectors.SECTION)
        || document.body

      handleInjectProductOfferToCartDrawer(cartDrawerSelectorOfProductOffersElement, productOfferWidgetId)

      observeDOM(cartDrawerWrapperElement, () => {
        const newCartDrawerSelectorOfProductOffersElement = cartDrawerWrapperElement.querySelector(
          cartDrawerSelectorOfProductOffers
        )

        // handleInjectProgressBarToCartDrawer(newCartDrawerSelectorOfProgressBarElement)
        handleInjectProductOfferToCartDrawer(newCartDrawerSelectorOfProductOffersElement, productOfferWidgetId)
      })
    }
  })
}

/**
 * @description Function to insert an input checkbox into ATC form
 *              Also this observes when a FORM is added to the SESSION contain CHECKBOXES
 * @author Sona
 */
export function handleInjectCheckboxesInputToATCForm() {
  const onFormAdded = (mutationsList: MutationRecord[]): void => {
    mutationsList.forEach(mutation => {
      mutation.addedNodes.forEach((node: any) => {
        if (
          node instanceof HTMLElement
          && (node.matches('form[action*="/cart/add"]') || node.querySelector('form[action*="/cart/add"]'))
        ) {
          const closestSession = node.closest(EHtmlSelectors.SECTION)
          if (!closestSession) return
          const checkboxes = closestSession.querySelectorAll('onetick-checkbox')
          checkboxes.forEach(checkbox => addAddOnToFormATC(checkbox as HTMLElement, node))
        }
      })
    })
  }
  observeDOM(document.body, onFormAdded)
}

export function handleInjectProgressBarToCartDrawer(
  cartDrawerSelectorOfProgressBarElement: Element | HTMLElement | null
) {
  if (!cartDrawerSelectorOfProgressBarElement?.parentNode) {
    return
  }

  // Return if Progress bar existed in the cart drawer
  if (cartDrawerSelectorOfProgressBarElement.parentNode.querySelector('onetick-progress-bar')) {
    return
  }

  const newOneTickProgressBarElement = document.createElement('onetick-progress-bar')
  newOneTickProgressBarElement.innerHTML = window.__onetick_store__['cachedProcessBarHTML']

  // Insert the progress bar after Cart Drawer Heading
  cartDrawerSelectorOfProgressBarElement.parentNode.insertBefore(
    newOneTickProgressBarElement,
    cartDrawerSelectorOfProgressBarElement.nextSibling
  )
}
