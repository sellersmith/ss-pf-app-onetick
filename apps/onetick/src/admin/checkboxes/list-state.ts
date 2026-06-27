// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickCheckbox } from './types'
import { DEFAULT_LIST_SORT } from './list-sort-options'

export interface OneTickListFilters {
  query: string
  status: string
  placement: string
  sort: string
}

export const defaultListFilters: OneTickListFilters = {
  query: '',
  status: 'all',
  placement: 'all',
  sort: DEFAULT_LIST_SORT,
}

function matchesStatus(item: OneTickCheckbox, status: string): boolean {
  if (status === 'all') return true
  if (status === 'active') return item.isActive
  if (status === 'draft') return !item.isActive
  return item.publishState?.status === 'failed'
}

function toTimestamp(value: string): number {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function compareBySort(a: OneTickCheckbox, b: OneTickCheckbox, sort: string): number {
  if (sort === 'updatedAt asc') return toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt)
  if (sort === 'title asc') return a.title.localeCompare(b.title)
  if (sort === 'title desc') return b.title.localeCompare(a.title)
  if (sort === 'manual') return a.sortOrder - b.sortOrder
  return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)
}

export function filterCheckboxes(items: OneTickCheckbox[], filters: OneTickListFilters): OneTickCheckbox[] {
  const query = filters.query.trim().toLowerCase()
  return items
    .filter(item => !query || `${item.title} ${item.checkboxContent.heading}`.toLowerCase().includes(query))
    .filter(item => matchesStatus(item, filters.status))
    .filter(item => filters.placement === 'all' || item.typePlacement === filters.placement)
    .sort((a, b) => compareBySort(a, b, filters.sort))
}
