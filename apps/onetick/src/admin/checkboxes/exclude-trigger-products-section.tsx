// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Checkbox, InlineGrid, Select } from '@shopify/polaris'
import React from 'react'
import { excludeProductOptions, triggerByOptions } from './form-options'
import { selectedOptions } from './resource-options'
import { SelectedResourceList } from './selected-resource-list'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxFormUpdater,
  OneTickResourceOption,
  OneTickTriggerProductsType,
} from './types'

interface ExcludeTriggerProductsSectionProps {
  form: OneTickCheckboxFormState
  excludeOptions: OneTickResourceOption[]
  renderSource(
    type: OneTickTriggerProductsType | null,
    ids: string[],
    updateIds: (ids: string[]) => void,
    field: 'exclude'
  ): React.ReactNode
  onChange(next: OneTickCheckboxFormUpdater): void
}

export const ExcludeTriggerProductsSection: React.FC<ExcludeTriggerProductsSectionProps> = ({
  form,
  excludeOptions,
  renderSource,
  onChange,
}) => {
  const set = (
    updates:
      | Partial<OneTickCheckboxFormState>
      | ((current: OneTickCheckboxFormState) => Partial<OneTickCheckboxFormState>)
  ) =>
    onChange(current => ({
      ...current,
      ...(typeof updates === 'function' ? updates(current) : updates),
    }))
  const excludeByProductsType: OneTickTriggerProductsType =
    form.excludeTriggerProductsType === 'specific-variants'
      ? 'specific-products'
      : form.excludeTriggerProductsType || 'product-collections'
  const showBySelector =
    form.excludeTriggerProductsType === 'specific-products' || form.excludeTriggerProductsType === 'specific-variants'

  const handleExcludeTriggerToggle = (checked: boolean) => {
    set({
      excludeTriggerProductsType: checked ? 'product-collections' : null,
      excludeTriggerProducts: [],
    })
  }

  const updateExcludeType = (value: OneTickTriggerProductsType) => {
    set({ excludeTriggerProductsType: value, excludeTriggerProducts: [] })
  }

  return (
    <BlockStack gap="300">
      <Checkbox
        label="Exclude specific products from trigger"
        checked={Boolean(form.excludeTriggerProductsType)}
        onChange={handleExcludeTriggerToggle}
      />
      {form.excludeTriggerProductsType ? (
        <BlockStack gap="300">
          <Select
            label="Exclude products"
            labelHidden
            options={excludeProductOptions}
            value={excludeByProductsType}
            onChange={value => updateExcludeType(value as OneTickTriggerProductsType)}
          />
          {showBySelector ? (
            <InlineGrid columns={{ md: '1fr 2fr', sm: 1 }} gap="300">
              <Select
                label="Select"
                labelInline
                options={triggerByOptions}
                value={form.excludeTriggerProductsType}
                onChange={value => updateExcludeType(value as OneTickTriggerProductsType)}
              />
              {renderSource(
                form.excludeTriggerProductsType,
                form.excludeTriggerProducts,
                ids => set({ excludeTriggerProducts: ids }),
                'exclude'
              )}
            </InlineGrid>
          ) : (
            renderSource(
              form.excludeTriggerProductsType,
              form.excludeTriggerProducts,
              ids => set({ excludeTriggerProducts: ids }),
              'exclude'
            )
          )}
          <SelectedResourceList
            items={selectedOptions(form.excludeTriggerProducts, excludeOptions)}
            variant={form.excludeTriggerProductsType === 'product-tags' ? 'tag' : 'row'}
            showThumbnail={
              form.excludeTriggerProductsType === 'specific-products' ||
              form.excludeTriggerProductsType === 'specific-variants'
            }
            onRemove={id =>
              set(current => ({ excludeTriggerProducts: current.excludeTriggerProducts.filter(value => value !== id) }))
            }
          />
        </BlockStack>
      ) : null}
    </BlockStack>
  )
}
