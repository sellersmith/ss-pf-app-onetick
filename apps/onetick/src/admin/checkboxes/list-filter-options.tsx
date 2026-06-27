// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { IndexFiltersProps } from '@shopify/polaris'
import { ChoiceList } from '@shopify/polaris'
import React from 'react'
import type { OneTickListFilters } from './list-state'

interface ListFilterOptionsArgs {
  filters: OneTickListFilters
  onFiltersChange(next: OneTickListFilters): void
}

const statusLabels: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
}

const placementLabels: Record<string, string> = {
  product_page: 'Product page',
  cart: 'Cart',
}

export function createListFilterOptions({
  filters,
  onFiltersChange,
}: ListFilterOptionsArgs): Pick<IndexFiltersProps, 'filters' | 'appliedFilters'> {
  const listFilters: IndexFiltersProps['filters'] = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: 'Active', value: 'active' },
            { label: 'Draft', value: 'draft' },
          ]}
          selected={filters.status === 'all' ? [] : [filters.status]}
          onChange={value => onFiltersChange({ ...filters, status: value[0] || 'all' })}
        />
      ),
      shortcut: true,
    },
    {
      key: 'placement',
      label: 'Placement',
      filter: (
        <ChoiceList
          title="Placement"
          titleHidden
          choices={[
            { label: 'Product page', value: 'product_page' },
            { label: 'Cart', value: 'cart' },
          ]}
          selected={filters.placement === 'all' ? [] : [filters.placement]}
          onChange={value => onFiltersChange({ ...filters, placement: value[0] || 'all' })}
        />
      ),
      shortcut: true,
    },
  ]

  const appliedFilters: IndexFiltersProps['appliedFilters'] = []
  if (filters.status !== 'all') {
    appliedFilters.push({
      key: 'status',
      label: `Status: ${statusLabels[filters.status] || filters.status}`,
      onRemove: () => onFiltersChange({ ...filters, status: 'all' }),
    })
  }
  if (filters.placement !== 'all') {
    appliedFilters.push({
      key: 'placement',
      label: `Placement: ${placementLabels[filters.placement] || filters.placement}`,
      onRemove: () => onFiltersChange({ ...filters, placement: 'all' }),
    })
  }

  return { filters: listFilters, appliedFilters }
}
