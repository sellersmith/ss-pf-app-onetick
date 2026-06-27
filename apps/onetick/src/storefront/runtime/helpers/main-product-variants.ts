/**
 * Get title of product variant by id
 *
 * @param id
 * @returns  title of product variant by id
 */

export const getTitleProductVariantById = (id: string) => {
  const mainProduct = window.__onetick_store__?.mainProduct || []
  const variants = mainProduct?.variants || []
  if (variants?.length <= 1) {
    return ''
  }

  const variant = variants.find((variant: any) => String(variant.id) === id)
  return variant?.title || ''
}
