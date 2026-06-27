// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Card, Select, TextField } from '@shopify/polaris'
import React from 'react'
import type { OneTickCheckboxFormState, OneTickCheckboxFormUpdater } from './types'

interface WidgetConfigCardProps {
  form: OneTickCheckboxFormState
  titleError?: string
  fallbackTitle: string
  onChange(next: OneTickCheckboxFormUpdater): void
}

export const WidgetConfigCard: React.FC<WidgetConfigCardProps> = ({ form, titleError, fallbackTitle, onChange }) => {
  const handleTitleBlur = () => {
    if (form.title.length === 0) {
      onChange(current => ({ ...current, title: fallbackTitle }))
    }
  }

  return (
    <Card>
      <BlockStack gap="400">
        <TextField
          label="Title"
          value={form.title}
          onChange={title => onChange(current => ({ ...current, title }))}
          autoComplete="off"
          maxLength={255}
          error={titleError}
          helpText="This won't be shown to your customers."
          onBlur={handleTitleBlur}
        />
        <Select
          label="Status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Draft', value: 'draft' },
          ]}
          value={form.isActive ? 'active' : 'draft'}
          onChange={value => onChange(current => ({ ...current, isActive: value === 'active' }))}
        />
      </BlockStack>
    </Card>
  )
}
