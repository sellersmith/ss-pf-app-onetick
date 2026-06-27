import { isEmpty } from 'lodash'
import { EOneTickOrderPropertyKeys, EPlacementType, ETriggerProductsType } from '../constants'
import { getOneTickOrderProperties } from '../helpers/handle-onetick-order-properites'
import { fetchProductsInCart } from '../helpers/product-offers/query/fetch-products-in-cart'
import handleUpdateCart from '../utils/update-cart'

const {
  ALL_PRODUCTS,
  PRODUCT_COLLECTIONS,
  PRODUCT_TAGS,
  PRODUCT_TYPES,
  PRODUCT_VERDORS,
  SPECIFIC_PRODUCTS,
  SPECIFIC_VARIANTS,
} = ETriggerProductsType

const conditionMapping: Record<ETriggerProductsType, string> = {
  [PRODUCT_COLLECTIONS]: 'collections',
  [PRODUCT_TAGS]: 'tags',
  [PRODUCT_VERDORS]: 'vendor',
  [PRODUCT_TYPES]: 'productType',
  [SPECIFIC_PRODUCTS]: 'id',
  [ALL_PRODUCTS]: 'all-products',
  [SPECIFIC_VARIANTS]: 'variant_id',
}

/**
 * Class responsible for observing changes in the cart and removing add-on products based on certain conditions.
 *
 * @author Chin
 */
export class ObserverCartChangesAndRemoveAddOnProduct {
  private cartObserverChangeOrReload: PerformanceObserver | null = null
  public previousCartItems: any[] = []
  public listProductsAddOnRemoved: any[] = []
  private listCartItems: Element[] = []
  private eventListenersMap = new Map<Element, EventListener>()
  private hasClickRemoveCartItem = false
  private isCartPage = false

  constructor() {
    this.init()
  }

  async init() {
    const { isCartPage } = window?.__onetick_store__
    this.isCartPage = isCartPage

    this.initializeObserverCartChangeAndReload()
    this.isCartPage && this.detectAndAddEventForRemoveItemButtons()
    this.updateCartItems()
  }

  async updateCartItems() {
    this.previousCartItems = await this.fetchCartItems()
  }

  /**
   * Detects remove item buttons in the cart and attaches events to them.
   */
  detectAndAddEventForRemoveItemButtons() {
    const formCartItems = Array.from(document.querySelectorAll('form[action="/cart"]'))

    formCartItems.length && (this.listCartItems = formCartItems)

    formCartItems.forEach((form: any) => {
      const listButtonRemoveItem = Array.from(form.querySelectorAll('a[href^="/cart/change"][href$="0"]'))

      listButtonRemoveItem.forEach((button: any) => {
        !this.eventListenersMap.has(button) && this.attachRemoveItemEvent(button, form)
      })
    })
  }

  /**
   * Adds a loading overlay class to the cart form.
   * @param {HTMLFormElement} form - The cart form element.
   */
  addLoadingFormCartItem(form: HTMLFormElement | null = null) {
    const addLoadingClass = (form: HTMLFormElement) => {
      if (!form.classList.contains('onetick-form-loading-overlay')) {
        form.classList.add('onetick-form-loading-overlay')
      }
    }

    if (form) {
      addLoadingClass(form)
    } else {
      this.listCartItems.forEach(form => addLoadingClass(form as HTMLFormElement))
    }
  }

  /**
   * Removes the loading overlay class from all cart forms.
   */
  removeLoadingFormCartItem() {
    this.hasClickRemoveCartItem = false
    if (this.listCartItems.length) {
      this.listCartItems.forEach((form: any) => {
        form.classList.remove('onetick-form-loading-overlay')
      })
    }
  }

  attachRemoveItemEvent(button: HTMLAnchorElement, form: HTMLFormElement) {
    const removeItemClickHandler = (e: Event) => {
      const target = e.currentTarget as HTMLAnchorElement

      const input = target?.href
      const match = input.match(/id=([^&]+)/)
      const result = match ? match[1] : null

      // Return if don't find id
      if (!result) return

      // Find product removed
      const productRemoved = this.previousCartItems.find(item => item.key === result)

      // Return if don't find productRemoved
      if (!productRemoved) return

      this.hasClickRemoveCartItem = true
      this.addLoadingFormCartItem(form)
      this.handleCartObserver(productRemoved)
    }

    button.addEventListener('click', removeItemClickHandler)
    this.eventListenersMap.set(button, removeItemClickHandler)
  }

  async fetchCartItems(): Promise<any[]> {
    try {
      const { allProductIncludeAddonAndProperties } = await fetchProductsInCart()
      return allProductIncludeAddonAndProperties || []
    } catch (error) {
      console.error('Error while get cart item:', error)
      return []
    }
  }

  /**
   * Updates the cart items and the list of removed add-on products.
   * @param {any[]} cartItems - The current cart items.
   * @param {any[]} itemsToRemove - The items to be removed from the cart.
   * @returns {any[]} The updated cart items.
   */
  updateCartItemsAndRemovedList(cartItems: any[], itemsToRemove: any[]): any[] {
    if (!itemsToRemove.length) return cartItems
    const keysToRemove = new Set(itemsToRemove.map(item => item.key))
    this.listProductsAddOnRemoved.push(...itemsToRemove)
    return cartItems.filter(item => !keysToRemove.has(item.key))
  }

  /**
   * Handles the removal of add-on products from the product detail view.
   * @param {any[]} cartItems - The current cart items.
   * @param {any} removedItem - The item that was removed from the cart.
   */
  handleRemoveAddOnProductFromProductDetail(cartItems: any[], removedItem: any) {
    const removedItemProperties = removedItem?.properties || {}
    const removedItemOneTickProperties = getOneTickOrderProperties(removedItemProperties)

    // If the removed item added from product offer, return the current cart items.
    const isNotProductPageTrigger
      = Object.keys(removedItemOneTickProperties).length
      && removedItemOneTickProperties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.CART
    if (isNotProductPageTrigger) return cartItems

    const addOns = cartItems.filter((item: any) => {
      const properties = item?.properties || {}
      if (!properties[EOneTickOrderPropertyKeys.ONETICK_PROPERTIES]) return false

      const otProperties = getOneTickOrderProperties(properties)

      return (
        otProperties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.PRODUCT_DETAILS
        && otProperties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_ID_FLAG] === removedItem.id
        && otProperties[EOneTickOrderPropertyKeys.ONETICK_MASTER_VARIANT_ID] === `${removedItem?.variant_id}`
        && otProperties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE] === true
      )
    })

    return this.updateCartItemsAndRemovedList(cartItems, addOns)
  }

  /**
   * Checks if an add-on product matches with the current cart items.
   * @param {any} addOn - The add-on product to check.
   * @param {any[]} cartItems - The current cart items.
   * @returns {boolean} True if the add-on matches with the cart items, false otherwise.
   */
  isAddOnMatchWithCart(addOn: any, cartItems: any[]): boolean {
    const cartItemsExcludeAddOn = cartItems.filter((item: any) => item.id !== addOn.id)
    const addonProperties = addOn?.properties || {}
    const addonOneTickProperties = getOneTickOrderProperties(addonProperties)

    const { tpt: checkboxTriggerProductType, tp: checkboxTriggerProduct }
      = addonOneTickProperties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_DATA] || {}

    const fieldFilter = conditionMapping[checkboxTriggerProductType as ETriggerProductsType]

    if (!cartItemsExcludeAddOn.length) return true

    if (fieldFilter === 'all-products') return false

    return !cartItemsExcludeAddOn.some((cartItem: any) => {
      const cartField = cartItem[fieldFilter]
      return Array.isArray(cartField)
        ? cartField.some(value => checkboxTriggerProduct.includes(value.toString()))
        : checkboxTriggerProduct.includes(cartField.toString())
    })
  }

  /**
   * Handles the removal of add-on products from the cart.
   * @param {any[]} cartItems - The current cart items.
   */
  handleRemoveAddOnProductFromCart(cartItems: any[]) {
    const addOns = cartItems.filter((item: any) => {
      const properties = item?.properties || {}
      const otProperties = getOneTickOrderProperties(properties)
      return (
        otProperties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.CART
        && otProperties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE]
      )
    })

    const toRemove = addOns.filter((addOn: any) => this.isAddOnMatchWithCart(addOn, cartItems))
    this.updateCartItemsAndRemovedList(cartItems, toRemove)
  }

  /**
   * The 'updates' object is created by iterating over 'listProductsAddOnRemoved' and setting each item's 'key' to 0.
    It also includes the 'removedItem.key' explicitly as a part of the object with the value 0. This object is used to
    update the cart, marking the items for removal by setting their quantity to 0.
   */
  async updateCart(removedItem: any) {
    try {
      const updates = this.listProductsAddOnRemoved.reduce(
        (acc, item) => {
          acc[item?.key] = 0
          return acc
        },
        {
          [removedItem.key]: 0,
        }
      )

      //reset list products add-on removed
      this.listProductsAddOnRemoved = []

      const response = await fetch(`${window.Shopify.routes.root}cart/update.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      const updatedCart = await response.json()
      const fullCart = await fetch(`${window.Shopify.routes.root}cart.js`).then(res => res.json())

      handleUpdateCart(updatedCart, fullCart)
      this.removeLoadingFormCartItem()
    } catch (error) {
      console.warn("Don't worry, the add-on products will be removed on the next page load.")
      this.removeLoadingFormCartItem()
    }
  }

  /**
   * Handles changes in the cart by removing add-on products if necessary.
   * @param {any} removedItem - The item that was removed from the cart.
   */
  handleCartChange(removedItem: any) {
    let cartItemExcludeRemoveItem = [...this.previousCartItems.filter(item => item.key !== removedItem.key)]

    cartItemExcludeRemoveItem = this.handleRemoveAddOnProductFromProductDetail(cartItemExcludeRemoveItem, removedItem)
    this.handleRemoveAddOnProductFromCart(cartItemExcludeRemoveItem)

    if (!this.listProductsAddOnRemoved.length) {
      this.removeLoadingFormCartItem()
      return
    }

    this.updateCart(removedItem)
  }

  /**
   * Finds the item that was removed from the cart.
   * @param {any[]} currentItems - The current cart items.
   * @returns {any} The item that was removed from the cart.
   */
  findRemovedItem(currentItems: any[]): any {
    const currentIds = new Set(currentItems.map(item => `${item.id}-${item.variant_id}`))
    return this.previousCartItems.find(prevItem => !currentIds.has(`${prevItem.id}-${prevItem.variant_id}`))
  }

  /**
   * Observes changes in the cart and handles them accordingly.
   */
  async handleCartObserver(removeItem?: any) {
    try {
      const currentCartItems = await this.fetchCartItems()
      const removedItem = removeItem || this.findRemovedItem(currentCartItems)

      this.previousCartItems = currentCartItems

      if (!removedItem || isEmpty(removedItem)) return

      this.addLoadingFormCartItem()
      this.handleCartChange(removedItem)
    } catch (error) {
      this.removeLoadingFormCartItem()
      console.error('Error handling cart observer:', error)
    }
  }

  /**
   * Initializes the observer to handle cart add and reload actions.
   * This function listens for `/cart.js` (reload) and `/cart/add` (add item) API requests.
   */
  initializeObserverCartChangeAndReload() {
    this.cartObserverChangeOrReload = new PerformanceObserver(list => {
      const isValidRequestType = ['xmlhttprequest', 'fetch'].includes.bind(['xmlhttprequest', 'fetch'])

      const isMatchedRequestReloadCart = list.getEntries().some((entry: any) => {
        return isValidRequestType(entry.initiatorType) && /\/cart\.js/.test(entry.name)
      })

      const isMatchedRequestAddToCart = list.getEntries().some((entry: any) => {
        return isValidRequestType(entry.initiatorType) && /\/cart\/(add)/.test(entry.name)
      })

      const isMatchedRequestChange = list.getEntries().some((entry: any) => {
        return isValidRequestType(entry.initiatorType) && /\/cart\/(change)/.test(entry.name)
      })

      isMatchedRequestAddToCart && this.updateCartItems()
      this.isCartPage && isMatchedRequestReloadCart && this.detectAndAddEventForRemoveItemButtons()

      !this.hasClickRemoveCartItem && isMatchedRequestChange && this.handleCartObserver()
    })

    this.cartObserverChangeOrReload.observe({ entryTypes: ['resource'] })
  }
}
