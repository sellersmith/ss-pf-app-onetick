// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import {
  Box,
  Button,
  Checkbox,
  Divider,
  InlineStack,
  RadioButton,
  ResourceItem,
  ResourceList,
  Text,
  Thumbnail,
} from '@shopify/polaris'
import { ChevronDownIcon, ChevronRightIcon, ImageIcon } from '@shopify/polaris-icons'
import React, { useEffect, useState } from 'react'
import type { OneTickVariantProductGroup } from './resource-selector-groups'

interface VariantProductListProps {
  groups: OneTickVariantProductGroup[]
  selectedIds: string[]
  multiple?: boolean
  singleVariantSelection?: boolean
  onSelectionChange(ids: string[]): void
}

export const VariantProductList: React.FC<VariantProductListProps> = ({
  groups,
  selectedIds,
  multiple,
  singleVariantSelection,
  onSelectionChange,
}) => {
  const [openProductIds, setOpenProductIds] = useState<string[]>([])

  useEffect(() => {
    setOpenProductIds(current => {
      const selectedProductIds = groups
        .filter(group => group.variants.some(variant => selectedIds.includes(variant.id)))
        .map(group => group.id)
      return Array.from(new Set([...current, ...selectedProductIds]))
    })
  }, [groups, selectedIds])

  const toggleOpen = (productId: string) => {
    setOpenProductIds(current =>
      current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId]
    )
  }

  const handleProductSelection = (group: OneTickVariantProductGroup) => {
    const variantIds = group.variants.map(variant => variant.id)
    if (!multiple && singleVariantSelection) {
      onSelectionChange(variantIds[0] ? [variantIds[0]] : [])
      setOpenProductIds(current => (current.includes(group.id) ? current : [...current, group.id]))
      return
    }
    if (!multiple) {
      onSelectionChange(variantIds)
      setOpenProductIds(current => (current.includes(group.id) ? current : [...current, group.id]))
      return
    }

    const allSelected = variantIds.every(id => selectedIds.includes(id))
    const nextSelected = allSelected
      ? selectedIds.filter(id => !variantIds.includes(id))
      : Array.from(new Set([...selectedIds, ...variantIds]))
    onSelectionChange(nextSelected)
    setOpenProductIds(current => (current.includes(group.id) ? current : [...current, group.id]))
  }

  const handleVariantSelection = (variantId: string, checked: boolean) => {
    if (singleVariantSelection) {
      onSelectionChange(checked ? [variantId] : [])
      return
    }

    onSelectionChange(
      checked ? Array.from(new Set([...selectedIds, variantId])) : selectedIds.filter(id => id !== variantId)
    )
  }

  return (
    <ResourceList
      items={groups}
      renderItem={group =>
        renderVariantProductItem({
          group,
          multiple,
          singleVariantSelection,
          open: openProductIds.includes(group.id),
          selectedIds,
          onToggleOpen: () => toggleOpen(group.id),
          onProductSelection: () => handleProductSelection(group),
          onVariantSelection: handleVariantSelection,
        })
      }
    />
  )
}

function renderVariantProductItem({
  group,
  multiple,
  singleVariantSelection,
  open,
  selectedIds,
  onToggleOpen,
  onProductSelection,
  onVariantSelection,
}: {
  group: OneTickVariantProductGroup
  multiple?: boolean
  singleVariantSelection?: boolean
  open: boolean
  selectedIds: string[]
  onToggleOpen(): void
  onProductSelection(): void
  onVariantSelection(variantId: string, checked: boolean): void
}) {
  const ProductCheckerComponent = multiple ? Checkbox : RadioButton
  const selectedCount = group.variants.filter(variant => selectedIds.includes(variant.id)).length
  const productChecked = multiple ? selectedCount === group.variants.length : selectedCount > 0

  return (
    <ResourceItem id={group.id} accessibilityLabel={`Select ${group.title}`} onClick={onProductSelection}>
      <Box paddingBlock="200">
        <InlineStack gap="300" align="start" blockAlign="center" wrap={false}>
          <div
            onClick={event => {
              event.stopPropagation()
            }}
            style={{ width: 20 }}
          >
            {!group.hasOnlyDefaultVariant ? (
              <Button
                variant="monochromePlain"
                icon={open ? ChevronDownIcon : ChevronRightIcon}
                onClick={onToggleOpen}
              />
            ) : null}
          </div>
          <div
            onClick={event => {
              event.stopPropagation()
            }}
            style={{ width: 20 }}
          >
            <ProductCheckerComponent
              label={group.title}
              labelHidden
              checked={productChecked}
              onChange={onProductSelection}
            />
          </div>
          <Thumbnail size="small" alt={group.title} source={group.imageUrl || ImageIcon} />
          <div style={{ width: 'calc(100% - 96px)', cursor: 'pointer' }}>
            <Text as="h3" variant="bodyMd" fontWeight="medium" truncate>
              {group.title}
            </Text>
          </div>
        </InlineStack>
        {open && !group.hasOnlyDefaultVariant ? (
          <Box paddingBlockStart="200">
            <Divider />
            <div role="list" aria-label={`${group.title} variants`}>
              {group.variants.map(variant => {
                const VariantSelectorComponent = singleVariantSelection ? RadioButton : Checkbox
                return (
                  <div
                    role="listitem"
                    id={variant.id}
                    key={variant.id}
                    style={{ padding: '8px 0 8px 32px', cursor: 'pointer' }}
                    onClick={event => {
                      event.stopPropagation()
                      onVariantSelection(variant.id, !selectedIds.includes(variant.id))
                    }}
                  >
                    <InlineStack gap="300" blockAlign="center" wrap={false}>
                      <div
                        onClick={event => {
                          event.stopPropagation()
                        }}
                        style={{ width: 20 }}
                      >
                        <VariantSelectorComponent
                          label={variant.title}
                          labelHidden
                          checked={selectedIds.includes(variant.id)}
                          onChange={checked => onVariantSelection(variant.id, checked)}
                        />
                      </div>
                      <Box>
                        <Text as="h4" variant="bodyMd" fontWeight="medium" truncate>
                          {variant.title}
                        </Text>
                      </Box>
                    </InlineStack>
                  </div>
                )
              })}
            </div>
            <Divider />
          </Box>
        ) : null}
      </Box>
    </ResourceItem>
  )
}
