// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { ActionList, Box, Button, Popover } from '@shopify/polaris'
import React, { useState } from 'react'
import type { RichTextEditorToolbarConfig, RichTextEditorToolbarExtensionApi } from './rich-text-editor-types'

interface DynamicFieldToken {
  value: string
  label: string
  helpText: string
}

const dynamicFieldTokens: DynamicFieldToken[] = [
  { value: '{{price}}', label: '{{price}}', helpText: 'The price of the add-on product' },
  { value: '{{compare_at_price}}', label: '{{compare-at-price}}', helpText: 'The compare-at price of the add-on product' },
  { value: '{{variant_name}}', label: '{{variant-title}}', helpText: 'The selected variant of the add-on product' },
  { value: '{{product_title}}', label: '{{product-title}}', helpText: 'The name of the add-on product' },
]

const DynamicFieldExtension: React.FC<{ api: RichTextEditorToolbarExtensionApi }> = ({ api }) => {
  const [open, setOpen] = useState(false)
  return (
    <Box paddingInline="300" minHeight="24px" width="100%">
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Popover
          active={open}
          activator={
            <Button
              size="slim"
              onClick={() => setOpen(value => !value)}
              variant="monochromePlain"
              accessibilityLabel="Dynamic field"
              disclosure={open ? 'up' : 'down'}
            >
              Dynamic field
            </Button>
          }
          onClose={() => setOpen(false)}
        >
          <ActionList
            actionRole="menuitem"
            items={dynamicFieldTokens.map(token => ({
              content: token.label,
              helpText: token.helpText,
              onAction: () => {
                api.insertText(token.value)
                setOpen(false)
              },
            }))}
          />
        </Popover>
      </div>
    </Box>
  )
}

export function buildDynamicToolbarConfig(toolbarId?: string): RichTextEditorToolbarConfig {
  return {
    showDivider: false,
    formats: ['bold', 'italic', 'underline', 'color', 'background', 'link'],
    toolbarId,
    extensions: [{ type: 'dynamicField', render: api => <DynamicFieldExtension api={api} /> }],
  }
}
