import { EPlacementType, EOneTickOrderPropertyKeys, type ETriggerProductsType } from '../../constants'
import { getOneTickOrderProperties } from '../../helpers/handle-onetick-order-properites'
import { fetchProductIncludeAddonAndProperties } from '../../helpers/product-offers/query/fetch-products-in-cart'
import handleUpdateCart from '../update-cart'
import { windowFunctionCustom } from '../windowFunction'
import { conditionMapping } from './constant'

let listProductsAddOnRemoved: any[] = []

function updateCartItemsAndRemovedList(cartItems: any[], itemsToRemove: any[]): any[] {
  if (!itemsToRemove.length) return cartItems
  const keysToRemove = new Set(itemsToRemove.map(item => item.key))
  listProductsAddOnRemoved.push(...itemsToRemove)
  return cartItems.filter(item => !keysToRemove.has(item.key))
}

function handleRemoveAddOnProductFromProductDetail(cartItems: any[], removedItem: any) {
  // If the removed item added from product offer, return the current cart items.
  const isNotProductPageTrigger
    = Object.keys(removedItem?.properties || {}).length
    && removedItem?.properties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.CART
  if (isNotProductPageTrigger) return cartItems

  const addOns = cartItems.filter((item: any) => {
    const properties = getOneTickOrderProperties(item?.properties || {})
    return (
      properties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.PRODUCT_DETAILS
      && properties[EOneTickOrderPropertyKeys.ONETICK_MASTER_PRODUCT_ID] === `${removedItem.product_id}`
      && properties[EOneTickOrderPropertyKeys.ONETICK_MASTER_VARIANT_ID] === `${removedItem?.variant_id}`
      && properties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE] === true
    )
  })

  return updateCartItemsAndRemovedList(cartItems, addOns)
}

function isAddOnMatchWithCart(addOn: any, cartItems: any[]): boolean {
  const cartItemsExcludeAddOn = cartItems.filter((item: any) => item.id !== addOn.id)

  const properties = getOneTickOrderProperties(addOn?.properties || {})

  const { tpt: checkboxTriggerProductType, tp: checkboxTriggerProduct }
    = properties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_DATA] || {}

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

function handleRemoveAddOnProductFromCart(cartItems: any[]) {
  const addOns = cartItems.filter((item: any) => {
    const properties = getOneTickOrderProperties(item?.properties || {})
    return (
      properties[EOneTickOrderPropertyKeys.ONETICK_WIDGET_PLACEMENT] === EPlacementType.CART
      && properties[EOneTickOrderPropertyKeys.ONETICK_CHECKBOX_CAN_REMOVE_WHEN_TRIGGER_REMOVE]
    )
  })

  const toRemove = addOns.filter((addOn: any) => isAddOnMatchWithCart(addOn, cartItems))
  updateCartItemsAndRemovedList(cartItems, toRemove)
}

async function updateCart(parseBody: any) {
  try {
    if (!listProductsAddOnRemoved || !listProductsAddOnRemoved.length) return

    const updates = listProductsAddOnRemoved.reduce((acc, item) => {
      acc[item?.key] = 0
      return acc
    }, {})

    //reset list products add-on removed
    listProductsAddOnRemoved = []

    const response = await fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates,
        ...parseBody,
      }),
    })

    const updatedCart = await response.json()

    handleUpdateCart({}, updatedCart)
    return updatedCart
  } catch (error) {
    setCartFormsLoading(false)
    console.error('[OneTick] Failed to update cart:', error)
    console.warn("Don't worry, the add-on products will be removed on the next page load.")
  }
}

export function setCartFormsLoading(isLoading: boolean) {
  const forms = (windowFunctionCustom().GET_FORM_CART?.()
    || Array.from(document.querySelectorAll('form[action="/cart"]'))) as HTMLFormElement[]

  if (!forms || !forms.length) return

  forms.forEach(form => {
    form.classList.toggle('onetick-form-loading-overlay', isLoading)
  })
}

export async function handleCartChange(removedItem: any, cartItems: any[], parseBody: any = {}) {
  try {
    let cartItemExcludeRemoveItem = await fetchProductIncludeAddonAndProperties(cartItems)

    cartItemExcludeRemoveItem = handleRemoveAddOnProductFromProductDetail(cartItemExcludeRemoveItem, removedItem)
    handleRemoveAddOnProductFromCart(cartItemExcludeRemoveItem)

    if (listProductsAddOnRemoved && !listProductsAddOnRemoved.length) return {}

    return updateCart(parseBody)
  } catch (error) {
    console.error('[OneTick] Error while handling cart change:', error)
    return {}
  }
}
