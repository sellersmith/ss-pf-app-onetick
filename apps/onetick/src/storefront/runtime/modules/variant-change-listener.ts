import { EHtmlSelectors } from '../constants'

/**
 * Class representing a listener for variant changes.
 */
export class VariantChangeListener {
  private element: HTMLElement
  private selectedVariant: HTMLInputElement | null = null
  private isListened: boolean = false
  private isHandling: boolean = false

  /**
   * Creates an instance of VariantChangeListener.
   * @param element - The HTML element to attach the listener to.
   */
  constructor(element: HTMLElement) {
    this.element = element
  }

  /**
   * Gets the currently selected variant input element.
   * @returns The selected variant input element or null if not found.
   *
   * @author Sona
   */
  getSelectedVariant(): HTMLInputElement | any {
    if (this.selectedVariant) return this.selectedVariant

    const closestSession = this.element.closest(EHtmlSelectors.SECTION)
    if (!closestSession) return null

    const selectedVariant = Array.from(closestSession.querySelectorAll(EHtmlSelectors.INPUT_VARIANT_ID)).find(
      e => e?.value
    ) || {
      value: window?.ShopifyAnalytics?.meta?.selectedVariantId,
    }

    return selectedVariant
  }

  /**
   * Gets all selected variant input elements within the closest section.
   * @returns An array of selected variant input elements.
   *
   * @author Sona
   */
  getAllSelectedVariants(): HTMLInputElement[] {
    const closestSession = this.element.closest(EHtmlSelectors.SECTION)
    if (!closestSession) return []

    return Array.from(closestSession.querySelectorAll(EHtmlSelectors.INPUT_VARIANT_ID))
  }

  /**
   * Attaches a change event listener to all selected variant input elements.
   * @param callback - The function to call when a change event occurs.

   * @author Sona
   */
  listen(callback: Function) {
    // return if already listened
    if (this.isListened) return

    this.getAllSelectedVariants().forEach(selectedVariant => {
      selectedVariant.addEventListener('change', () => {
        // return if already handling
        if (this.isHandling) return
        this.isHandling = true

        // set selected variant
        if (!this.selectedVariant) this.selectedVariant = selectedVariant

        typeof callback === 'function' && callback()

        // reset isHandling after 100ms
        setTimeout(() => {
          this.isHandling = false
        }, 100)
      })
    })

    this.isListened = true
  }
}
