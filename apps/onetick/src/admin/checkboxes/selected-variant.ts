// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickCheckboxFormState, OneTickResourceOption, OneTickSetupResources } from './types'

export interface OneTickSelectedVariant {
  id: string
  title: string
  price?: string
  compareAtPrice?: string
  product: {
    id: string
    title: string
    featuredImage?: { url?: string }
    hasOnlyDefaultVariant?: boolean
    variants?: Array<{ id: string; title: string; price?: string; compareAtPrice?: string }>
  }
}

function resourceToVariant(option: OneTickResourceOption, allVariants: OneTickResourceOption[]): OneTickSelectedVariant {
  // Setup options may carry sibling variants embedded on a product or as flat variant rows. Support
  // both shapes so the editor can render the selected add-on variant after reload.
  const embeddedVariants = option.variants?.map(variant => ({
    id: variant.id,
    title: variant.title,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
  })) || []
  const snapshotSiblingVariants = allVariants
    .filter(variant => variant.parentId && variant.parentId === option.parentId)
    .map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
    }))
  const siblingVariants = embeddedVariants.length ? embeddedVariants : snapshotSiblingVariants
  const variants = siblingVariants.length
    ? siblingVariants
    : [{ id: option.id, title: option.title, price: option.price, compareAtPrice: option.compareAtPrice }]

  return {
    id: option.id,
    title: option.title,
    price: option.price,
    compareAtPrice: option.compareAtPrice,
    product: {
      id: option.parentId || '',
      title: option.parentTitle || option.title,
      featuredImage: option.imageUrl ? { url: option.imageUrl } : undefined,
      hasOnlyDefaultVariant: variants.length === 1 && option.title === 'Default Title',
      variants,
    },
  }
}

export function selectedUpsellVariant(
  form: OneTickCheckboxFormState,
  resources: OneTickSetupResources
): OneTickSelectedVariant | null {
  const variantId = form.upsellProducts[0]?.variantId
  if (!variantId) return null
  const option = resources.variants.find(item => item.id === variantId)
  return option ? resourceToVariant(option, resources.variants) : null
}
