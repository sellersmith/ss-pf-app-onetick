/**
 * Get main product id
 * @returns main product id on product page
 */
export const getMainProductId = () => {
  return String(window.__onetick_store__?.mainProduct?.id || '')
}

/**
 * Get main product title
 * @returns main product title on product page
 */
export const getMainProductTitle = () => {
  return window.__onetick_store__?.mainProduct?.title || ''
}
