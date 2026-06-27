// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickResourceOption } from './types'

export interface OneTickVariantProductGroup {
  id: string
  title: string
  imageUrl?: string
  hasOnlyDefaultVariant: boolean
  variants: OneTickResourceOption[]
}

export function groupVariantOptionsByProduct(options: OneTickResourceOption[]): OneTickVariantProductGroup[] {
  const byProduct = new Map<string, OneTickVariantProductGroup>()

  // TailorKit's selector groups flat variant search results by parent product, while keeping the
  // single Default Title variant as a product-level row.
  options.forEach(option => {
    const productId = option.parentId || option.id
    const group = byProduct.get(productId) || {
      id: productId,
      title: option.parentTitle || option.title,
      imageUrl: option.imageUrl,
      hasOnlyDefaultVariant: false,
      variants: [],
    }

    group.imageUrl = group.imageUrl || option.imageUrl
    group.variants.push(option)
    group.hasOnlyDefaultVariant = group.variants.length === 1 && group.variants[0]?.title === 'Default Title'
    byProduct.set(productId, group)
  })

  return [...byProduct.values()]
}
