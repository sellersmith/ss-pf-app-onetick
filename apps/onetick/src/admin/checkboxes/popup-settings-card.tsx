// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Card, Checkbox, Text, TextField } from '@shopify/polaris'
import React from 'react'
import { RichTextEditor } from './rich-text-editor'
import { buildDynamicToolbarConfig } from './rich-text-toolbar-config'
import type { OneTickCheckboxFormState, OneTickCheckboxFormUpdater } from './types'

interface PopupSettingsCardProps {
  form: OneTickCheckboxFormState
  onChange(next: OneTickCheckboxFormUpdater): void
}

export const PopupSettingsCard: React.FC<PopupSettingsCardProps> = ({ form, onChange }) => {
  const popup = form.popup
  const update = <K extends keyof typeof popup>(key: K, value: (typeof popup)[K]) =>
    onChange(current => ({ ...current, popup: { ...current.popup, [key]: value } }))
  const toolbarConfig = buildDynamicToolbarConfig('popup-heading-toolbar')

  return (
    <Card roundedAbove="sm">
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Popup
        </Text>
        <Checkbox label="Show popup" checked={popup.showPopup} onChange={value => update('showPopup', value)} />
        {popup.showPopup ? (
          <BlockStack gap="400">
            <TextField
              label="Heading"
              value={popup.heading}
              onChange={value => update('heading', value)}
              autoComplete="off"
              placeholder="This is your popup heading."
            />
            <RichTextEditor
              label="Description"
              value={popup.description}
              onChange={value => update('description', value)}
              toolbarConfig={toolbarConfig}
              plainTextPaste
              placeholder="Popup description placeholder"
            />
          </BlockStack>
        ) : null}
      </BlockStack>
    </Card>
  )
}
