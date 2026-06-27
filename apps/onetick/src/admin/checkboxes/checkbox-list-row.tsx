// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { ActionList, Badge, BlockStack, Box, Button, IndexTable, InlineStack, Link, Popover, Text } from '@shopify/polaris'
import { MenuHorizontalIcon } from '@shopify/polaris-icons'
import React, { useState } from 'react'
import { getDistanceToNow } from './time'
import type { OneTickCheckbox, OneTickListAction } from './types'

interface CheckboxListRowProps {
  item: OneTickCheckbox
  index: number
  selected?: boolean
  condensed?: boolean
  onEdit(item: OneTickCheckbox): void
  onMutate(item: OneTickCheckbox, action: OneTickListAction): void
}

function placementLabel(value: string | null): string {
  if (value === 'cart') return 'Cart'
  if (value === 'product_page') return 'Product page'
  if (value === 'product_details') return 'Product details'
  return 'Not set'
}

export const CheckboxListRow: React.FC<CheckboxListRowProps> = ({
  item,
  index,
  selected,
  condensed,
  onEdit,
  onMutate,
}) => {
  const [open, setOpen] = useState(false)
  const statusBadge = <Badge tone={item.isActive ? 'success' : undefined}>{item.isActive ? 'Active' : 'Draft'}</Badge>
  const actions = [
    { content: item.isActive ? 'Set as draft' : 'Set as active', onAction: () => onMutate(item, item.isActive ? 'deactivate' : 'activate') },
    { content: 'Duplicate', onAction: () => onMutate(item, 'duplicate') },
    { content: 'Delete', destructive: true, onAction: () => onMutate(item, 'delete') },
  ]

  if (condensed) {
    return (
      <IndexTable.Row id={item.id} position={index} onClick={() => {}} selected={selected}>
        <IndexTable.Cell>
          <InlineStack gap="200" wrap={false}>
            <InlineStack wrap={false} gap="200" blockAlign="center" align="space-between">
              <Box width="calc(100vw - 100px)">
                <BlockStack gap="100">
                  <div
                    onClick={event => {
                      event.preventDefault()
                      event.stopPropagation()
                      onEdit(item)
                    }}
                  >
                    <Link monochrome removeUnderline>
                      <Text variant="bodyMd" as="span" fontWeight="semibold" truncate>
                        {item.title || 'Untitled'}
                      </Text>
                    </Link>
                  </div>
                  <InlineStack gap="200" align="start">
                    {statusBadge}
                    <Text as="span" variant="bodySm" tone="subdued">{placementLabel(item.typePlacement)}</Text>
                  </InlineStack>
                  <Text as="span" variant="bodySm" tone="subdued">Updated {getDistanceToNow(item.updatedAt)}</Text>
                </BlockStack>
              </Box>
              <Box>
                <Popover
                  active={open}
                  onClose={() => setOpen(false)}
                  activator={<Button icon={MenuHorizontalIcon} variant="tertiary" onClick={() => setOpen(!open)} />}
                >
                  <ActionList items={actions} />
                </Popover>
              </Box>
            </InlineStack>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  }

  return (
    <IndexTable.Row id={item.id} position={index} selected={selected} onClick={() => onEdit(item)}>
      <IndexTable.Cell>
        <Text variant="bodyMd" as="span" truncate>
          <Link monochrome removeUnderline onClick={() => onEdit(item)}>{item.title || 'Untitled'}</Link>
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{statusBadge}</IndexTable.Cell>
      <IndexTable.Cell><Text variant="bodyMd" as="span">{placementLabel(item.typePlacement)}</Text></IndexTable.Cell>
      <IndexTable.Cell><Text variant="bodyMd" as="span">{getDistanceToNow(item.updatedAt)}</Text></IndexTable.Cell>
    </IndexTable.Row>
  )
}
