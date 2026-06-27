// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickResourceOption, OneTickSetupResources, OneTickTriggerProductsType } from './types'

export function optionsForType(type: OneTickTriggerProductsType | null, resources: OneTickSetupResources): OneTickResourceOption[] {
  if (type === 'specific-products') return resources.products
  if (type === 'specific-variants') return resources.variants
  if (type === 'product-collections') return resources.collections
  if (type === 'product-tags') return resources.tags
  if (type === 'product-vendors') return resources.vendors
  if (type === 'product-types') return resources.productTypes
  return []
}

export function selectedOptions(ids: string[], options: OneTickResourceOption[]): OneTickResourceOption[] {
  const byId = new Map(options.map(option => [option.id, option]))
  return ids.map(id => byId.get(id) || { id, title: id }).filter(Boolean)
}

export function optionLabel(option: OneTickResourceOption): string {
  return option.parentTitle ? `${option.parentTitle} / ${option.title}` : option.title
}

export function optionPrimaryLabel(option: OneTickResourceOption): string {
  return option.parentTitle || option.title
}

export function optionSecondaryLabel(option: OneTickResourceOption): string | undefined {
  if (!option.parentTitle || option.title === 'Default Title') return undefined
  return option.title
}

function expandEmbeddedVariantOptions(options: OneTickResourceOption[]): OneTickResourceOption[] {
  return options.flatMap(option => {
    if (!option.variants?.length) return [option]

    const parentId = option.parentId || option.id
    const parentTitle = option.parentTitle || option.title
    const siblingOptions = option.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      parentId,
      parentTitle,
      imageUrl: option.imageUrl,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      variants: option.variants,
    }))

    return option.parentId ? [option, ...siblingOptions] : siblingOptions
  })
}

export function mergeResourceOptions(...groups: OneTickResourceOption[][]): OneTickResourceOption[] {
  const byId = new Map<string, OneTickResourceOption>()
  expandEmbeddedVariantOptions(groups.flat()).forEach(option => {
    if (!option.id) return
    byId.set(option.id, { ...byId.get(option.id), ...option })
  })
  return [...byId.values()]
}
