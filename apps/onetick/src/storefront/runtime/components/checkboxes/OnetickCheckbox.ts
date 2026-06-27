/* eslint-disable no-useless-constructor */
import { EPlacementType, EPubSubEvents } from '../../constants'
import { addAddOnToFormATC } from '../../helpers/checkboxes/add-addon-to-atc-form'
import addCartWithCheckBox from '../../helpers/checkboxes/add-event-checkbox'
import { getAddToCartForms } from '../../helpers/checkboxes/get-atc-form'
import { sendViewedEvent } from '../../utils/ga4'
import { subscribe } from '../../utils/pubsub'

class OnetickCheckbox extends HTMLElement {
  private disconnectVisibleObserver: any
  private allowATC: boolean | undefined
  private addToCartForms: Element[]
  constructor() {
    super()
    this.addToCartForms = getAddToCartForms(this)
  }

  init() {
    const { isCartPage } = window.__onetick_store__

    const checkboxInput: HTMLInputElement = this.querySelector('.onetick-checkbox > input') as HTMLInputElement

    const elementStoreMasterProductId = this.parentElement?.querySelector('.onetick-master-product')

    // Assuming 'this' is an HTMLElement and elementStoreMasterProductId is an HTMLElement or null/undefined
    const sourceElement = elementStoreMasterProductId || this
    const currentMasterProductId = sourceElement.getAttribute('data-target-product')

    const isCartOrCartDrawer
      = (isCartPage || this.parentElement?.getAttribute('data-drawer-cart')) && !currentMasterProductId

    const loadingCheckBoxWhenAdd = () => {
      this.classList.add('loading')
      this.style.opacity = '0.5'
      this.style.pointerEvents = 'none'
    }

    const handleClickCheckboxInCart = async () => {
      loadingCheckBoxWhenAdd()
      await addCartWithCheckBox(this)
      this.style.display = 'none'
    }

    const handleClickCheckboxInProductDetail = () => {
      this.toggleInputATCForms()
    }
    this.toggleInputATCForms()

    // Listen to event to update add-to-cart form
    this.addEventListener('click', async e => {
      // Check if the click event is triggered by the checkbox input or its label
      const isClickCheckboxInput
        = e.target === this.querySelector('.onetick-checkbox > span') || e.target === checkboxInput

      // Check if text is selected at the time of the click
      const selection = window.getSelection()
      const selectedText = selection ? selection.toString().trim() : ''

      if (selectedText.length > 0 && !isClickCheckboxInput) {
        return // Stop further execution if text is selected
      }

      if (!this.allowATC) return
      if (!(e.target as HTMLElement).closest('.ot-editor-link')) {
        checkboxInput.checked = !checkboxInput.checked

        if (checkboxInput.checked && isCartOrCartDrawer) {
          await handleClickCheckboxInCart()
        } else {
          handleClickCheckboxInProductDetail()
        }
      }
    })
  }

  toggleInputATCForms = () => {
    if (!this.addToCartForms.length) return
    const upsellVariantId = this.getAttribute('data-upsell-variant-id')
    if (!upsellVariantId) return
    this.addToCartForms.forEach(atcForm => addAddOnToFormATC(this, atcForm as HTMLElement))
  }
  /**
   * Removes input elements with a specific data-checkbox-id attribute from Add To Cart (ATC) forms.
   *
   * This function retrieves all ATC forms associated with the current context and removes any input elements
   * within those forms that have a data-checkbox-id attribute matching the current element's data-checkbox-id attribute.
   *
   * @returns {void} This function does not return a value.
   *
   * @author Sona
   */
  removeInputATCForms = () => {
    if (!this.addToCartForms.length) return
    const checkboxId = this.getAttribute('data-checkbox-id')
    this.addToCartForms.forEach(atcForm => {
      atcForm
        .querySelectorAll(`input.onetick_atc_input[data-checkbox-id="${checkboxId}"]`)
        .forEach(input => input.parentNode?.removeChild(input))
    })
  }

  initVisibleObservers() {
    this.disconnectVisibleObserver && this.disconnectVisibleObserver()
    const checkboxId = this.getAttribute('data-checkbox-id')
    const key = `${checkboxId}_viewed`
    const { isCartPage } = window.__onetick_store__
    const isCartOrCartDrawer = isCartPage || this.parentElement?.getAttribute('data-drawer-cart') === 'true'

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !sessionStorage.getItem(key)) {
            const placement = isCartOrCartDrawer ? EPlacementType.CART : EPlacementType.PRODUCT_DETAILS
            const events = {
              onetick_checkbox_id: checkboxId,
              onetick_checkbox_placement: placement,
              onetick_checkbox_view_count: 1,
            }
            sendViewedEvent(events)
            sessionStorage.setItem(key, 'true')
          }
        })
      },
      {
        root: null,
        threshold: 0.01,
      }
    )

    observer.observe(this)

    this.disconnectVisibleObserver = () => observer.disconnect()
  }

  setAllowATC() {
    const itv = setInterval(() => {
      const { addonVariants } = window.__onetick_store__

      if (addonVariants) {
        const defaultAddonVariantId = this.getAttribute('data-upsell-variant-id')

        const defaultAddonVariant = addonVariants?.[defaultAddonVariantId] || null

        this.allowATC = defaultAddonVariant?.allowATC

        const checkboxInput: HTMLInputElement = this.querySelector('.onetick-checkbox > input') as HTMLInputElement

        if (checkboxInput) {
          if (!this.allowATC) {
            checkboxInput.checked = false
            checkboxInput.disabled = true

            // Hide data in ATC forms if checkbox is not available to selling
            const addToCartForms = getAddToCartForms(this)
            addToCartForms.forEach(atcForm => addAddOnToFormATC(this, atcForm as HTMLElement))
          } else {
            checkboxInput.disabled = false
          }
        }

        const warningElement = this?.querySelector('.warning')

        warningElement
          && (this.allowATC
            ? warningElement.classList.remove('warning-sold-out')
            : warningElement.classList.add('warning-sold-out'))

        clearInterval(itv)
      }
    }, 50)
  }

  connectedCallback() {
    subscribe(EPubSubEvents.REMOVE_DATA_INPUT_FORM, () => this.removeInputATCForms())
    this.setAllowATC()
    this.init()
    window.__onetick_store__?.enableAnalytics && this.initVisibleObservers()
  }

  static get observedAttributes() {
    return ['data-upsell-variant-id']
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    this.setAllowATC()
  }

  disconnectedCallback() {
    if (!this) return

    this.disconnectVisibleObserver && this.disconnectVisibleObserver()
  }
}

customElements.get('onetick-checkbox') || customElements.define('onetick-checkbox', OnetickCheckbox)
