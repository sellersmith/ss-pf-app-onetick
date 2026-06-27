// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Box, Button, InlineStack, Tag, Text, Thumbnail } from '@shopify/polaris'
import { ImageIcon, XIcon } from '@shopify/polaris-icons'
import React, { useState } from 'react'
import { optionPrimaryLabel, optionSecondaryLabel } from './resource-options'
import type { OneTickResourceOption } from './types'

interface SelectedResourceListProps {
  items: OneTickResourceOption[]
  variant?: 'row' | 'tag'
  showThumbnail?: boolean
  onEdit?: (item: OneTickResourceOption) => void
  onRemove(id: string): void
}

export const SelectedResourceList: React.FC<SelectedResourceListProps> = ({
  items,
  variant = 'row',
  showThumbnail = true,
  onEdit,
  onRemove,
}) => {
  const [expanded, setExpanded] = useState(false)
  if (!items.length) return null

  const visible = expanded ? items : items.slice(0, 5)
  const hiddenCount = items.length - visible.length
  const rowMoreLabel = expanded ? 'Show fewer products' : `Show ${hiddenCount} more products`
  const tagMoreLabel = expanded ? 'Show fewer products' : `+${hiddenCount} ${hiddenCount > 1 ? 'tags' : 'tag'}`
  const moreButton = items.length > 5 ? (
    <Box padding="300" borderBlockStartWidth={variant === 'tag' ? '0' : '025'} borderColor="border">
      <Button variant="plain" disclosure={expanded ? 'up' : 'down'} onClick={() => setExpanded(!expanded)}>
        {variant === 'tag' ? tagMoreLabel : rowMoreLabel}
      </Button>
    </Box>
  ) : null

  if (variant === 'tag') {
    return (
      <Box>
        <InlineStack gap="100" wrap>
          {visible.map(item => (
            <Tag key={item.id} onRemove={() => onRemove(item.id)}>
              {optionPrimaryLabel(item)}
            </Tag>
          ))}
        </InlineStack>
        {moreButton}
      </Box>
    )
  }

  return (
    <Box borderColor="border" borderWidth="025" borderRadius="200">
      {visible.map((item, index) => (
          <Box key={item.id} padding="300" borderBlockStartWidth={index ? '025' : '0'} borderColor="border">
            <InlineStack wrap={false} gap="200" blockAlign="center" align="space-between">
              <InlineStack wrap={false} gap="200" blockAlign="center">
                {showThumbnail ? (
                  <Thumbnail size="small" source={item.imageUrl || ImageIcon} alt={item.title} />
                ) : null}
                <Box width="100%">
                  <Text as="p" variant="bodyMd" truncate>{optionPrimaryLabel(item)}</Text>
                  {optionSecondaryLabel(item) ? (
                    <Text as="p" variant="bodySm" tone="subdued" truncate>{optionSecondaryLabel(item)}</Text>
                  ) : null}
                </Box>
              </InlineStack>
              {onEdit ? (
                <Button variant="plain" onClick={() => onEdit(item)} accessibilityLabel="Edit">Edit</Button>
              ) : null}
              <Button icon={XIcon} variant="plain" onClick={() => onRemove(item.id)} accessibilityLabel="Remove" />
            </InlineStack>
        </Box>
      ))}
      {moreButton}
    </Box>
  )
}
