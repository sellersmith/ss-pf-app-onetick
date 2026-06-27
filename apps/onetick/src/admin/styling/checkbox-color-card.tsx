// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import { BlockStack, Box, Card, Divider, InlineStack, Text } from '@shopify/polaris'
import React, { useCallback } from 'react'
import type { OneTickCheckboxGlobalStyling } from '../checkboxes/types'
import { ColorField } from './color-field'

interface CheckboxColorCardProps {
  styling: OneTickCheckboxGlobalStyling
  onChange(updates: Partial<OneTickCheckboxGlobalStyling>): void
}

interface ColorRowProps {
  label: string
  value: string
  onChange(color: string): void
}

function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <InlineStack gap="400" align="space-between" blockAlign="center" wrap={false}>
      <Box minWidth="140px">
        <Text as="span" variant="bodyMd" tone="subdued">{label}</Text>
      </Box>
      <Box width="100%">
        <ColorField label={label} value={value} onChange={onChange} />
      </Box>
    </InlineStack>
  )
}

export const CheckboxColorCard: React.FC<CheckboxColorCardProps> = ({ styling, onChange }) => {
  const handleColorChange = useCallback(
    (field: keyof OneTickCheckboxGlobalStyling) => (color: string) => {
      onChange({ [field]: color })
    },
    [onChange]
  )

  const handleCheckboxItemChange = useCallback(
    (field: keyof OneTickCheckboxGlobalStyling['checkboxItem']) => (color: string) => {
      onChange({
        checkboxItem: {
          ...styling.checkboxItem,
          [field]: color,
        },
      })
    },
    [onChange, styling.checkboxItem]
  )

  return (
    <Card roundedAbove="sm" padding="0">
      <Box padding="400">
        <BlockStack gap="300">
          <Text variant="headingSm" as="span">Icon color</Text>
          <ColorRow label="Check mark" value={styling.tickIcon} onChange={handleColorChange('tickIcon')} />
        </BlockStack>
      </Box>
      <Divider />
      <Box padding="400">
        <BlockStack gap="300">
          <Text variant="headingSm" as="span">Add-on</Text>

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="medium">Background color</Text>
            <InlineStack gap="400" wrap>
              <Box minWidth="200px" width="calc(50% - 8px)">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">Inactive state</Text>
                  <ColorField
                    label="Inactive state"
                    value={styling.defaultBackground}
                    onChange={handleColorChange('defaultBackground')}
                  />
                </BlockStack>
              </Box>
              <Box minWidth="200px" width="calc(50% - 8px)">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">Active state</Text>
                  <ColorField
                    label="Active state"
                    value={styling.activeBackground}
                    onChange={handleColorChange('activeBackground')}
                  />
                </BlockStack>
              </Box>
            </InlineStack>
          </BlockStack>

          <BlockStack gap="200">
            <Text as="span" variant="bodyMd" fontWeight="medium">Border color</Text>
            <InlineStack gap="400" wrap>
              <Box minWidth="200px" width="calc(50% - 8px)">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">Inactive state</Text>
                  <ColorField
                    label="Inactive state"
                    value={styling.defaultBorder}
                    onChange={handleColorChange('defaultBorder')}
                  />
                </BlockStack>
              </Box>
              <Box minWidth="200px" width="calc(50% - 8px)">
                <BlockStack gap="100">
                  <Text as="span" variant="bodySm" tone="subdued">Active state</Text>
                  <ColorField
                    label="Active state"
                    value={styling.activeBorder}
                    onChange={handleColorChange('activeBorder')}
                  />
                </BlockStack>
              </Box>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </Box>
      <Divider />
      <Box padding="400">
        <BlockStack gap="300">
          <Text variant="headingSm" as="span">Add-on item</Text>
          <ColorRow
            label="Background color"
            value={styling.checkboxItem.defaultBackground}
            onChange={handleCheckboxItemChange('defaultBackground')}
          />
          <ColorRow
            label="Border color"
            value={styling.checkboxItem.defaultBorder}
            onChange={handleCheckboxItemChange('defaultBorder')}
          />
        </BlockStack>
      </Box>
    </Card>
  )
}
