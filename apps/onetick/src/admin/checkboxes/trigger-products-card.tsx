// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Button, Card, Checkbox, Icon, InlineError, InlineGrid, InlineStack, Select, Text, TextField } from '@shopify/polaris'
import { SearchIcon } from '@shopify/polaris-icons'
import React, { useState } from 'react'
import { ExcludeTriggerProductsSection } from './exclude-trigger-products-section'
import { triggerByOptions, triggerTypeOptions } from './form-options'
import { OptionCombobox } from './option-combobox'
import { ResourceSelectorModal } from './resource-selector-modal'
import { mergeResourceOptions, optionPrimaryLabel, optionsForType, selectedOptions } from './resource-options'
import { SelectedResourceList } from './selected-resource-list'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxFormUpdater,
  OneTickResourceOption,
  OneTickResourceSearch,
  OneTickSetupResources,
  OneTickTriggerProductsType,
} from './types'

interface TriggerProductsCardProps {
  form: OneTickCheckboxFormState
  resources: OneTickSetupResources
  hideAllProductsOption?: boolean
  error?: string
  onChange(next: OneTickCheckboxFormUpdater): void
  onSearchResources?: OneTickResourceSearch
}

type PickerState = null | { field: 'target' | 'exclude'; kind: 'products' | 'variants'; initialQuery?: string }

function optionPlaceholder(type: OneTickTriggerProductsType | null): string {
  if (type === 'product-collections') return 'Search collections'
  if (type === 'product-tags') return 'Search tags'
  if (type === 'product-vendors') return 'Search vendors'
  if (type === 'product-types') return 'Search product types'
  if (type === 'specific-variants') return 'Search variants'
  return 'Search products'
}

export const TriggerProductsCard: React.FC<TriggerProductsCardProps> = ({
  form,
  resources,
  hideAllProductsOption = false,
  error,
  onChange,
  onSearchResources,
}) => {
  const [picker, setPicker] = useState<PickerState>(null)
  const [pickedOptions, setPickedOptions] = useState<OneTickResourceOption[]>([])
  const set = (
    updates:
      | Partial<OneTickCheckboxFormState>
      | ((current: OneTickCheckboxFormState) => Partial<OneTickCheckboxFormState>)
  ) =>
    onChange(current => ({
      ...current,
      ...(typeof updates === 'function' ? updates(current) : updates),
    }))
  const targetOptions = mergeResourceOptions(optionsForType(form.triggerProductsType, resources), pickedOptions)
  const excludeOptions = mergeResourceOptions(optionsForType(form.excludeTriggerProductsType, resources), pickedOptions)
  const triggerByProductsType = form.triggerProductsType === 'specific-variants'
    ? 'specific-products'
    : form.triggerProductsType

  const handleTriggerTypeChange = (value: OneTickTriggerProductsType) => {
    set({
      triggerProductsType: value,
      targetProducts: value === 'all-products' ? ['all-products'] : [],
      excludeUpsellProducts: true,
    })
  }

  const openPicker = (type: OneTickTriggerProductsType, field: 'target' | 'exclude', initialQuery?: string) => {
    setPicker({ field, kind: type === 'specific-variants' ? 'variants' : 'products', initialQuery })
  }
  const editTargetVariants = (item: OneTickResourceOption) => (
    openPicker('specific-variants', 'target', item.parentTitle || optionPrimaryLabel(item))
  )
  const renderSource = (
    type: OneTickTriggerProductsType | null,
    ids: string[],
    updateIds: (ids: string[]) => void,
    field: 'target' | 'exclude',
  ) => {
    if (type === 'specific-products' || type === 'specific-variants') {
      return (
        <InlineStack gap="200" wrap={false} blockAlign="start">
          <BoxWidth>
            <TextField
              label={optionPlaceholder(type)}
              labelHidden
              value=""
              readOnly
              autoComplete="off"
              placeholder={optionPlaceholder(type)}
              prefix={<Icon source={SearchIcon} />}
              onFocus={() => openPicker(type, field)}
            />
          </BoxWidth>
          <Button onClick={() => openPicker(type, field)}>Browse</Button>
        </InlineStack>
      )
    }
    if (type && type !== 'all-products') {
      return (
        <OptionCombobox
          options={optionsForType(type, resources)}
          selected={ids}
          placeholder={optionPlaceholder(type)}
          showImagePlaceholder={type === 'product-collections'}
          onChange={updateIds}
        />
      )
    }
    return null
  }

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">Trigger products</Text>
          <Text as="p" variant="bodyMd">Add-on products will appear on these products or product groups.</Text>
        </BlockStack>
        <Select
          label="Trigger products"
          labelHidden
          options={triggerTypeOptions
            .filter(option => !hideAllProductsOption || option.value !== 'all-products')
            .map(option => ({ label: option.label, value: option.value }))}
          value={triggerByProductsType}
          onChange={value => handleTriggerTypeChange(value as OneTickTriggerProductsType)}
        />
        {['specific-products', 'specific-variants'].includes(form.triggerProductsType) ? (
          <InlineGrid columns={{ md: '1fr 2fr', sm: 1 }} gap="300">
            <Select
              label="Select"
              labelInline
              options={triggerByOptions}
              value={form.triggerProductsType}
              onChange={value => handleTriggerTypeChange(value as OneTickTriggerProductsType)}
            />
            {renderSource(form.triggerProductsType, form.targetProducts, ids => set({ targetProducts: ids }), 'target')}
          </InlineGrid>
        ) : (
          renderSource(form.triggerProductsType, form.targetProducts, ids => set({ targetProducts: ids }), 'target')
        )}
        {form.triggerProductsType !== 'all-products' ? (
          <SelectedResourceList
            items={selectedOptions(form.targetProducts, targetOptions)}
            showThumbnail={form.triggerProductsType === 'specific-products'
              || form.triggerProductsType === 'specific-variants'
              || form.triggerProductsType === 'product-collections'}
            onEdit={form.triggerProductsType === 'specific-variants' ? editTargetVariants : undefined}
            onRemove={id => set(current => ({ targetProducts: current.targetProducts.filter(value => value !== id) }))}
          />
        ) : null}
        {error ? <InlineError message={error} fieldID="trigger-products" /> : null}
        <ExcludeTriggerProductsSection
          form={form}
          excludeOptions={excludeOptions}
          renderSource={renderSource}
          onChange={onChange}
        />
        {triggerByProductsType !== 'specific-products' ? (
          <Checkbox
            label="Exclude add-on product from trigger products"
            checked={form.excludeUpsellProducts}
            onChange={value => set({ excludeUpsellProducts: value })}
          />
        ) : null}
      </BlockStack>
      {picker ? (
        <ResourceSelectorModal
          open
          title="Select product"
          placeholder={picker.kind === 'variants' ? 'Search variants' : 'Search products'}
          options={mergeResourceOptions(picker.kind === 'variants' ? resources.variants : resources.products, pickedOptions)}
          selectedIds={picker.field === 'exclude' ? form.excludeTriggerProducts : form.targetProducts}
          initialQuery={picker.initialQuery}
          multiple={picker.field === 'target' ? !hideAllProductsOption : true}
          onClose={() => setPicker(null)}
          onSearch={onSearchResources ? query => onSearchResources(picker.kind, query) : undefined}
          onSelect={(ids, selected) => {
            setPickedOptions(current => mergeResourceOptions(current, selected))
            picker.field === 'exclude' ? set({ excludeTriggerProducts: ids }) : set({ targetProducts: ids })
            setPicker(null)
          }}
        />
      ) : null}
    </Card>
  )
}

const BoxWidth = ({ children }: { children: React.ReactNode }) => <div style={{ width: '100%' }}>{children}</div>
