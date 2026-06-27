// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import {
  Card,
  IndexFilters,
  IndexFiltersMode,
  IndexTable,
  useBreakpoints,
  useIndexResourceState,
  useSetIndexFiltersMode,
} from '@shopify/polaris'
import React, { useMemo } from 'react'
import { filterCheckboxes, type OneTickListFilters } from './list-state'
import { CheckboxListRow } from './checkbox-list-row'
import { createListFilterOptions } from './list-filter-options'
import { OneTickListEmptyState } from './list-empty-state'
import { createListSortOptions, DEFAULT_LIST_SORT } from './list-sort-options'
import type { OneTickCheckbox, OneTickListAction } from './types'

interface OneTickCheckboxListProps {
  items: OneTickCheckbox[]
  filters: OneTickListFilters
  loading: boolean
  selectedAction: OneTickListAction | null
  selectionResetKey: number
  onFiltersChange(next: OneTickListFilters): void
  onSelectionChange(ids: string[]): void
  onCreate(): void
  onEdit(item: OneTickCheckbox): void
  onMutate(item: OneTickCheckbox, action: OneTickListAction): void
  onDuplicateBulk(): void
  onBulk(action: Exclude<OneTickListAction, 'duplicate'>): void
}

const tabs = [{ content: 'All', id: 'all' }]

export const OneTickCheckboxList: React.FC<OneTickCheckboxListProps> = ({
  items,
  filters,
  loading,
  selectedAction,
  selectionResetKey,
  onFiltersChange,
  onSelectionChange,
  onCreate,
  onEdit,
  onMutate,
  onDuplicateBulk,
  onBulk,
}) => {
  const visibleItems = useMemo(() => filterCheckboxes(items, filters), [items, filters])
  const { selectedResources, allResourcesSelected, handleSelectionChange, clearSelection } = useIndexResourceState(visibleItems)
  const previousSelectionResetKey = React.useRef(selectionResetKey)
  const condensed = useBreakpoints().smDown
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Default)
  const { filters: listFilters, appliedFilters } = createListFilterOptions({ filters, onFiltersChange })
  const sortOptions = createListSortOptions()

  React.useEffect(() => {
    if (previousSelectionResetKey.current !== selectionResetKey) {
      previousSelectionResetKey.current = selectionResetKey
      clearSelection()
    }
  }, [clearSelection, selectionResetKey])

  React.useEffect(() => onSelectionChange(selectedResources), [onSelectionChange, selectedResources])

  const selectedItems = useMemo(
    () => visibleItems.filter(item => selectedResources.includes(item.id)),
    [selectedResources, visibleItems]
  )
  const selectedHasActive = selectedItems.some(item => item.isActive)
  const selectedHasDraft = selectedItems.some(item => !item.isActive)
  const promotedBulkActions = [
    selectedHasDraft ? { content: 'Set as active', onAction: () => onBulk('activate') } : null,
    selectedHasActive ? { content: 'Set as draft', onAction: () => onBulk('deactivate') } : null,
  ].filter((action): action is { content: string; onAction: () => void } => Boolean(action))
  const bulkActions = [
    { content: 'Duplicate', onAction: onDuplicateBulk },
    { content: 'Delete', destructive: true, onAction: () => onBulk('delete') },
  ]

  return (
    <Card padding="0">
      <IndexFilters
        queryValue={filters.query}
        queryPlaceholder="Search add-on products"
        onQueryChange={query => onFiltersChange({ ...filters, query })}
        onQueryClear={() => onFiltersChange({ ...filters, query: '' })}
        tabs={tabs}
        selected={0}
        onSelect={() => {}}
        canCreateNewView={false}
        filters={listFilters}
        appliedFilters={appliedFilters}
        mode={mode}
        setMode={setMode}
        sortOptions={sortOptions}
        sortSelected={[filters.sort || DEFAULT_LIST_SORT]}
        onSort={value => onFiltersChange({ ...filters, sort: value[0] || DEFAULT_LIST_SORT })}
      />
      <IndexTable
        condensed={condensed}
        resourceName={{ singular: 'add-on product', plural: 'add-on products' }}
        itemCount={visibleItems.length}
        selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
        onSelectionChange={handleSelectionChange}
        headings={[{ title: 'Title' }, { title: 'Status' }, { title: 'Placement' }, { title: 'Last updated' }]}
        promotedBulkActions={promotedBulkActions}
        bulkActions={bulkActions}
        loading={loading || Boolean(selectedAction)}
        emptyState={loading ? undefined : <OneTickListEmptyState onCreate={onCreate} />}
      >
        {visibleItems.map((item, index) => (
          <CheckboxListRow
            key={item.id}
            item={item}
            index={index}
            condensed={condensed}
            selected={selectedResources.includes(item.id)}
            onEdit={onEdit}
            onMutate={(mutated, action) => {
              clearSelection()
              onMutate(mutated, action)
            }}
          />
        ))}
      </IndexTable>
    </Card>
  )
}
