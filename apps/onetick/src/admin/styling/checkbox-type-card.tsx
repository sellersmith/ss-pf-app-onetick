// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import { BlockStack, Card, Select, Text } from '@shopify/polaris'
import React from 'react'
import type { OneTickCheckboxGlobalStyling } from '../checkboxes/types'

interface CheckboxTypeCardProps {
  styling: OneTickCheckboxGlobalStyling
  onChange(updates: Partial<OneTickCheckboxGlobalStyling>): void
}

const options = [
  { value: '0px', label: 'Square' },
  { value: '50%', label: 'Round' },
  { value: '4px', label: 'Rounded corner' },
]

export const CheckboxTypeCard: React.FC<CheckboxTypeCardProps> = ({ styling, onChange }) => (
  <Card>
    <BlockStack gap="200">
      <Text variant="headingSm" as="span">Add-on type</Text>
      <Select label="Add-on type" labelHidden options={options} value={styling.checkboxType} onChange={checkboxType => onChange({ checkboxType })} />
    </BlockStack>
  </Card>
)
