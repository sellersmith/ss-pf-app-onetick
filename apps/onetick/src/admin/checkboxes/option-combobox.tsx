// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { AutoSelection, Box, Checkbox, Combobox, InlineStack, Listbox, Scrollable, Text, Thumbnail } from '@shopify/polaris'
import { ImageIcon } from '@shopify/polaris-icons'
import React, { useMemo, useState } from 'react'
import { optionLabel, optionPrimaryLabel, optionSecondaryLabel } from './resource-options'
import type { OneTickResourceOption } from './types'

interface OptionComboboxProps {
  options: OneTickResourceOption[]
  selected: string[]
  placeholder: string
  showImagePlaceholder?: boolean
  onChange(ids: string[]): void
}

export const OptionCombobox: React.FC<OptionComboboxProps> = ({
  options,
  selected,
  placeholder,
  showImagePlaceholder = false,
  onChange,
}) => {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return options
    return options.filter(option => optionLabel(option).toLowerCase().includes(keyword))
  }, [options, query])

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id])
  }

  return (
    <Combobox
      allowMultiple
      activator={
        <Combobox.TextField
          label={placeholder}
          labelHidden
          value={query}
          onChange={setQuery}
          placeholder={placeholder}
          autoComplete="off"
          clearButton
          onClearButtonClick={() => setQuery('')}
        />
      }
    >
      <Scrollable style={{ maxHeight: '280px' }}>
        {filtered.length ? (
          <Listbox autoSelection={AutoSelection.None}>
            {filtered.map(option => (
              <Listbox.Option key={option.id} value={option.id} selected={selected.includes(option.id)}>
                <div
                  style={{ width: '100%' }}
                  onClickCapture={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    toggle(option.id)
                  }}
                >
                  <Box padding="200">
                    <InlineStack wrap={false} gap="300" blockAlign="center">
                      <Checkbox
                        label={optionLabel(option)}
                        labelHidden
                        checked={selected.includes(option.id)}
                        onChange={() => toggle(option.id)}
                      />
                      {option.imageUrl || showImagePlaceholder ? (
                        <Thumbnail size="small" source={option.imageUrl || ImageIcon} alt={option.title} />
                      ) : null}
                      <Box width="100%">
                        <Text as="p" variant="bodyMd" truncate>{optionPrimaryLabel(option)}</Text>
                        {optionSecondaryLabel(option) ? (
                          <Text as="p" variant="bodySm" tone="subdued" truncate>{optionSecondaryLabel(option)}</Text>
                        ) : null}
                      </Box>
                    </InlineStack>
                  </Box>
                </div>
              </Listbox.Option>
            ))}
          </Listbox>
        ) : (
          <Box paddingBlockStart="1600" paddingBlockEnd="1600">
            <Text as="p" variant="bodySm" tone="subdued" alignment="center">
              {query ? 'No results found' : 'No options available'}
            </Text>
          </Box>
        )}
      </Scrollable>
    </Combobox>
  )
}
