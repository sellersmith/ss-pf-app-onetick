// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import {
  Box,
  Checkbox,
  Icon,
  InlineStack,
  Modal,
  RadioButton,
  ResourceItem,
  ResourceList,
  Spinner,
  Text,
  TextField,
  Thumbnail,
} from '@shopify/polaris'
import { ImageIcon, SearchIcon } from '@shopify/polaris-icons'
import React, { useEffect, useMemo, useState } from 'react'
import { mergeResourceOptions, optionLabel, optionPrimaryLabel, optionSecondaryLabel } from './resource-options'
import { groupVariantOptionsByProduct } from './resource-selector-groups'
import { VariantProductList } from './resource-selector-product-list'
import type { OneTickResourceOption } from './types'

interface ResourceSelectorModalProps {
  open: boolean
  title: string
  placeholder: string
  options: OneTickResourceOption[]
  selectedIds: string[]
  multiple?: boolean
  singleVariantSelection?: boolean
  emptyMessage?: string
  initialQuery?: string
  onClose(): void
  onSelect(ids: string[], selected: OneTickResourceOption[]): void
  onSearch?(query: string): Promise<OneTickResourceOption[]>
}

export const ResourceSelectorModal: React.FC<ResourceSelectorModalProps> = ({
  open,
  title,
  placeholder,
  options,
  selectedIds,
  multiple,
  singleVariantSelection,
  emptyMessage = 'No resources found',
  initialQuery,
  onClose,
  onSelect,
  onSearch,
}) => {
  const [query, setQuery] = useState('')
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds)
  const [remoteOptions, setRemoteOptions] = useState<OneTickResourceOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setQuery(initialQuery || '')
    setLocalSelected(selectedIds)
    setRemoteOptions([])
  }, [initialQuery, multiple, open, options, selectedIds, singleVariantSelection, title])

  useEffect(() => {
    const keyword = query.trim()
    if (!open || !onSearch || !keyword) {
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    const timer = window.setTimeout(() => {
      onSearch(keyword)
        .then(results => {
          if (active) {
            setRemoteOptions(current =>
              mergeResourceOptions(
                current.filter(option => localSelected.includes(option.id)),
                results
              )
            )
          }
        })
        .catch(error => {
          console.error('[OneTick] Cannot search resources', error)
          if (active) setRemoteOptions([])
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [localSelected, open, onSearch, query, title])

  const optionPool = useMemo(() => mergeResourceOptions(options, remoteOptions), [options, remoteOptions])
  const selectedOptions = useMemo(
    () => localSelected.flatMap(id => optionPool.find(option => option.id === id) || []),
    [localSelected, optionPool]
  )
  const visibleOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (onSearch && keyword) return mergeResourceOptions(selectedOptions, remoteOptions)
    if (!keyword) return optionPool
    return optionPool.filter(option => optionLabel(option).toLowerCase().includes(keyword))
  }, [onSearch, optionPool, query, remoteOptions, selectedOptions])
  const showVariantProductList = visibleOptions.some(option => option.parentId)
  const variantProductGroups = useMemo(() => groupVariantOptionsByProduct(visibleOptions), [visibleOptions])

  const toggle = (id: string) => {
    setLocalSelected(current => {
      const next = !multiple
        ? current.includes(id)
          ? []
          : [id]
        : current.includes(id)
          ? current.filter(value => value !== id)
          : [...current, id]
      return next
    })
  }
  const updateSelectionFromProductList = (next: string[]) => {
    setLocalSelected(next)
  }
  const submit = () => {
    onSelect(localSelected, selectedOptions)
  }
  const CheckerComponent = multiple ? Checkbox : RadioButton

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{ content: 'Select', disabled: !localSelected.length, onAction: submit }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
    >
      <Modal.Section>
        <Box minHeight="520px">
          <TextField
            label="Search"
            labelHidden
            value={query}
            onChange={setQuery}
            placeholder={placeholder}
            autoComplete="off"
            clearButton
            prefix={<Icon source={SearchIcon} />}
            onClearButtonClick={() => setQuery('')}
          />
          <div style={{ maxHeight: 460, overflowY: 'auto', paddingTop: 12 }}>
            {loading ? (
              <InlineStack align="center">
                <Spinner size="small" />
              </InlineStack>
            ) : null}
            {!loading && !visibleOptions.length ? (
              <Box padding="400">
                <Text as="p" variant="bodyMd" tone="subdued">
                  {emptyMessage}
                </Text>
              </Box>
            ) : null}
            {showVariantProductList ? (
              <VariantProductList
                groups={variantProductGroups}
                selectedIds={localSelected}
                multiple={multiple}
                singleVariantSelection={singleVariantSelection}
                onSelectionChange={updateSelectionFromProductList}
              />
            ) : (
              <ResourceList
                items={visibleOptions}
                renderItem={option => {
                  const checked = localSelected.includes(option.id)
                  const primaryLabel = optionPrimaryLabel(option)
                  const secondaryLabel = optionSecondaryLabel(option)
                  return (
                    <ResourceItem
                      id={option.id}
                      onClick={() => toggle(option.id)}
                      accessibilityLabel={`Select ${primaryLabel}`}
                    >
                      <InlineStack wrap={false} gap="300" blockAlign="center">
                        <div onClick={event => event.stopPropagation()}>
                          <CheckerComponent
                            label="Select resource"
                            labelHidden
                            checked={checked}
                            onChange={() => toggle(option.id)}
                          />
                        </div>
                        <Thumbnail size="small" source={option.imageUrl || ImageIcon} alt={option.title} />
                        <Box width="100%">
                          <Text as="p" variant="bodyMd" fontWeight="medium" truncate>
                            {primaryLabel}
                          </Text>
                          {secondaryLabel ? (
                            <Text as="p" variant="bodySm" tone="subdued" truncate>
                              {secondaryLabel}
                            </Text>
                          ) : null}
                        </Box>
                      </InlineStack>
                    </ResourceItem>
                  )
                }}
              />
            )}
          </div>
        </Box>
      </Modal.Section>
    </Modal>
  )
}
