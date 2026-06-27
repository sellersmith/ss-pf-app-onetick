// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  InlineError,
  InlineStack,
  Text,
  Thumbnail,
} from '@shopify/polaris'
import { ImageIcon } from '@shopify/polaris-icons'
import React, { useState } from 'react'
import { ResourceSelectorModal } from './resource-selector-modal'
import { mergeResourceOptions, optionPrimaryLabel, optionSecondaryLabel, selectedOptions } from './resource-options'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxFormUpdater,
  OneTickResourceOption,
  OneTickResourceSearch,
  OneTickSetupResources,
} from './types'

interface UpsellProductCardProps {
  form: OneTickCheckboxFormState
  resources: OneTickSetupResources
  error?: string
  onChange(next: OneTickCheckboxFormUpdater): void
  onSearchResources?: OneTickResourceSearch
  onPickedVariantsChange?: (variants: OneTickResourceOption[]) => void
}

export const UpsellProductCard: React.FC<UpsellProductCardProps> = ({
  form,
  resources,
  error,
  onChange,
  onSearchResources,
  onPickedVariantsChange,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickedVariants, setPickedVariants] = useState<OneTickResourceOption[]>([])
  const selectedVariantIds = form.upsellProducts.map(item => item.variantId)
  const variantOptions = mergeResourceOptions(resources.variants, pickedVariants)
  const selectedVariant = selectedOptions(selectedVariantIds, variantOptions)[0]

  const updateVariantIds = (ids: string[], picked = variantOptions) => {
    const selectedVariant = ids
      .map(
        variantId =>
          picked.find(option => option.id === variantId) || variantOptions.find(option => option.id === variantId)
      )
      .find(Boolean)
    const upsellProducts = ids.flatMap(variantId => {
      const variant =
        picked.find(option => option.id === variantId) || variantOptions.find(option => option.id === variantId)
      const productId = variant?.parentId
      return productId ? [{ productId, variantId }] : []
    })
    onChange(currentForm => {
      const checkboxContent = selectedVariant
        ? {
            ...currentForm.checkboxContent,
            heading: `Add ${selectedVariant.parentTitle || optionPrimaryLabel(selectedVariant)}`,
            imageUrl: selectedVariant.imageUrl || '',
          }
        : currentForm.checkboxContent
      const nextForm = { ...currentForm, upsellProducts, checkboxContent }
      return nextForm
    })
  }

  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">
          Add-on product
        </Text>
        <Text as="h2" variant="bodyMd">
          Select the product variant you want to upsell or cross-sell.
        </Text>
        {selectedVariant ? (
          <SelectedVariantCard variant={selectedVariant} onChange={() => setPickerOpen(true)} />
        ) : (
          <Box>
            <Button onClick={() => setPickerOpen(true)}>Select product</Button>
          </Box>
        )}
        {!selectedVariant && error ? <InlineError message={error} fieldID="addon-product" /> : null}
        {selectedVariant ? (
          <Checkbox
            label="Remove when all trigger products are removed from cart"
            checked={form.canRemoveWhenTriggersCleared}
            onChange={value => onChange(current => ({ ...current, canRemoveWhenTriggersCleared: value }))}
          />
        ) : null}
      </BlockStack>
      <ResourceSelectorModal
        open={pickerOpen}
        title="Select product"
        placeholder="Search add-on variants"
        options={variantOptions}
        selectedIds={selectedVariantIds}
        singleVariantSelection
        onClose={() => setPickerOpen(false)}
        onSearch={onSearchResources ? query => onSearchResources('variants', query) : undefined}
        onSelect={(ids, selected) => {
          setPickedVariants(current => {
            const nextPickedVariants = mergeResourceOptions(current, selected)
            onPickedVariantsChange?.(nextPickedVariants)
            return nextPickedVariants
          })
          updateVariantIds(ids.slice(0, 1), selected)
          setPickerOpen(false)
        }}
      />
    </Card>
  )
}

const SelectedVariantCard = ({ variant, onChange }: { variant: OneTickResourceOption; onChange(): void }) => (
  <Box borderColor="border" borderWidth="025" borderRadius="200">
    <Box padding="300">
      <InlineStack wrap={false} gap="200" blockAlign="center" align="space-between">
        <Box width="calc(100% - 100px)">
          <InlineStack wrap={false} gap="200" blockAlign="center">
            <Box minWidth="40px">
              <Thumbnail size="small" source={variant.imageUrl || ImageIcon} alt={variant.title} />
            </Box>
            <Box width="100%">
              <BlockStack gap="100" inlineAlign="start">
                <Box width="100%">
                  <Text as="span" variant="bodyMd" fontWeight="medium" truncate>
                    {optionPrimaryLabel(variant)}
                  </Text>
                </Box>
                <InlineStack gap="200">
                  {optionSecondaryLabel(variant) ? <Badge>{optionSecondaryLabel(variant)}</Badge> : null}
                  <InlineStack gap="100">
                    {variant.price ? (
                      <Text as="span" variant="bodyMd">
                        {variant.price}
                      </Text>
                    ) : null}
                    {variant.compareAtPrice ? (
                      <Text as="span" variant="bodyMd" tone="subdued" textDecorationLine="line-through">
                        {variant.compareAtPrice}
                      </Text>
                    ) : null}
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Box>
          </InlineStack>
        </Box>
        <Button onClick={onChange}>Change</Button>
      </InlineStack>
    </Box>
  </Box>
)
