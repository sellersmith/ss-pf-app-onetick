// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { IndexFiltersProps } from '@shopify/polaris'

export const DEFAULT_LIST_SORT = 'updatedAt desc'

export function createListSortOptions(): IndexFiltersProps['sortOptions'] {
  return [
    { label: 'Name', value: 'title asc', directionLabel: 'A-Z' },
    { label: 'Name', value: 'title desc', directionLabel: 'Z-A' },
    { label: 'Last updated', value: 'updatedAt asc', directionLabel: 'Oldest first' },
    { label: 'Last updated', value: 'updatedAt desc', directionLabel: 'Newest first' },
  ]
}
