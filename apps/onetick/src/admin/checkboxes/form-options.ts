// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickPlacementType, OneTickTriggerProductsType } from './types'

export const triggerTypeOptions: Array<{ label: string; value: OneTickTriggerProductsType }> = [
  { label: 'All products', value: 'all-products' },
  { label: 'Specific products', value: 'specific-products' },
]

export const excludeProductOptions: Array<{ label: string; value: OneTickTriggerProductsType }> = [
  { label: 'Product collections', value: 'product-collections' },
  { label: 'Product tags', value: 'product-tags' },
  { label: 'Product vendors', value: 'product-vendors' },
  { label: 'Product types', value: 'product-types' },
  { label: 'Specific products', value: 'specific-products' },
]

export const triggerByOptions: Array<{ label: string; value: OneTickTriggerProductsType }> = [
  { label: 'By products', value: 'specific-products' },
  { label: 'By variants', value: 'specific-variants' },
]

export const placementOptions: Array<{ label: string; value: OneTickPlacementType }> = [
  { label: 'Product details', value: 'product_details' },
  { label: 'Cart', value: 'cart' },
]

export const contentTypeOptions = [
  { label: 'Heading only', value: 'heading_only' },
  { label: 'Description only', value: 'description_only' },
  { label: 'Heading and description', value: 'heading_and_description' },
]

export const statusOptions = [
  { label: 'All status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Publish failed', value: 'failed' },
]

export const sortOptions = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Title A-Z', value: 'title' },
  { label: 'Manual order', value: 'manual' },
]
