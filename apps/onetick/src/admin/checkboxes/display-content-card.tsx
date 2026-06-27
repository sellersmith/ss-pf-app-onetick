// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Box, Card, Checkbox, InlineStack, Select, Text, TextField, Thumbnail, Tooltip } from '@shopify/polaris'
import { ImageIcon } from '@shopify/polaris-icons'
import React from 'react'
import { contentTypeOptions } from './form-options'
import { RichTextEditor } from './rich-text-editor'
import { buildDynamicToolbarConfig } from './rich-text-toolbar-config'
import type { OneTickSelectedVariant } from './selected-variant'
import type { OneTickCheckboxFormState, OneTickCheckboxFormUpdater } from './types'

interface DisplayContentCardProps {
  form: OneTickCheckboxFormState
  selectedVariantData?: OneTickSelectedVariant | null
  onChange(next: OneTickCheckboxFormUpdater): void
}

interface TickOptionProps {
  label: string
  checked: boolean
  disabled: boolean
  tooltipContent?: string
  onChange(checked: boolean): void
}

const TickOption: React.FC<TickOptionProps> = ({ label, checked, disabled, tooltipContent, onChange }) => {
  const checkbox = <Checkbox label={label} checked={checked} disabled={disabled} onChange={onChange} />
  return disabled && tooltipContent ? <Tooltip content={tooltipContent} dismissOnMouseOut>{checkbox}</Tooltip> : checkbox
}

export const DisplayContentCard: React.FC<DisplayContentCardProps> = ({ form, selectedVariantData, onChange }) => {
  const content = form.checkboxContent
  const update = <K extends keyof typeof content>(key: K, value: (typeof content)[K]) =>
    onChange(current => ({ ...current, checkboxContent: { ...current.checkboxContent, [key]: value } }))
  const noAddonProductSelected = !selectedVariantData
  const hasOnlyDefaultVariant = selectedVariantData?.product?.hasOnlyDefaultVariant ?? true
  const disabledTooltip = 'Select add-on product first'
  const variantTooltip = 'Add-on has no variants'
  const showHeading = content.contentType === 'heading_only' || content.contentType === 'heading_and_description'
  const showDescription = content.contentType === 'description_only' || content.contentType === 'heading_and_description'
  const headingToolbarConfig = buildDynamicToolbarConfig('display-heading-toolbar')
  const descriptionToolbarConfig = buildDynamicToolbarConfig('display-description-toolbar')
  const handleShowPriceChange = (checked: boolean) => {
    onChange(current => {
      const currentContent = current.checkboxContent
      return {
        ...current,
        checkboxContent: {
          ...currentContent,
          showPrice: checked,
          showComparedPrice: checked ? currentContent.showComparedPrice : false,
        },
      }
    })
  }
  const handleShowFeaturedImageChange = (checked: boolean) => {
    if (checked && !content.imageUrl && selectedVariantData?.product?.featuredImage?.url) {
      onChange(current => {
        const currentContent = current.checkboxContent
        return {
          ...current,
          checkboxContent: {
            ...currentContent,
            showFeaturedImage: checked,
            imageUrl: currentContent.imageUrl || selectedVariantData.product.featuredImage.url,
          },
        }
      })
      return
    }
    update('showFeaturedImage', checked)
  }
  const handleShowVariantSelectorChange = (checked: boolean) => {
    if (hasOnlyDefaultVariant) return
    update('showVariantSelector', checked)
  }

  return (
    <Card roundedAbove="sm" padding="0">
      <Box padding="400">
        <Text as="h2" variant="headingMd">Display content</Text>
      </Box>
      <Box padding="400" borderBlockStartWidth="025" borderBlockEndWidth="025" borderColor="border">
        <BlockStack gap="100">
          {form.typePlacement !== 'cart' ? (
            <TickOption
              label="Tick add-on by default"
              checked={content.preCheck}
              disabled={noAddonProductSelected}
              tooltipContent={disabledTooltip}
              onChange={value => update('preCheck', value)}
            />
          ) : null}
          <TickOption
            label="Show variant selection"
            checked={content.showVariantSelector}
            disabled={noAddonProductSelected || hasOnlyDefaultVariant}
            tooltipContent={noAddonProductSelected ? disabledTooltip : variantTooltip}
            onChange={handleShowVariantSelectorChange}
          />
          <TickOption
            label="Show price"
            checked={content.showPrice}
            disabled={noAddonProductSelected}
            tooltipContent={disabledTooltip}
            onChange={handleShowPriceChange}
          />
          {content.showPrice ? (
            <TickOption
              label="Show compare-at price"
              checked={content.showComparedPrice}
              disabled={noAddonProductSelected}
              tooltipContent={disabledTooltip}
              onChange={value => update('showComparedPrice', value)}
            />
          ) : null}
          <TickOption
            label="Show featured image"
            checked={content.showFeaturedImage}
            disabled={noAddonProductSelected}
            tooltipContent={disabledTooltip}
            onChange={handleShowFeaturedImageChange}
          />
          {content.showFeaturedImage ? (
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Box minWidth="40px">
                <Thumbnail size="small" source={content.imageUrl || ImageIcon} alt="Featured image" />
              </Box>
              <Box width="100%">
                <TextField
                  label="Image URL"
                  labelHidden
                  value={content.imageUrl}
                  onChange={value => update('imageUrl', value)}
                  autoComplete="off"
                  placeholder="https://example.com/image.jpg"
                />
              </Box>
            </InlineStack>
          ) : null}
        </BlockStack>
      </Box>
      <Box padding="400">
        <BlockStack gap="300">
          <Select
            label="Content type"
            options={contentTypeOptions}
            value={content.contentType}
            onChange={value => update('contentType', value as typeof content.contentType)}
          />
          {showHeading ? (
            <RichTextEditor
              label="Heading"
              value={content.heading}
              onChange={value => update('heading', value)}
              toolbarConfig={headingToolbarConfig}
              plainTextPaste
              placeholder="Add-on heading placeholder"
            />
          ) : null}
          {showDescription ? (
            <RichTextEditor
              label="Description"
              value={content.description}
              onChange={value => update('description', value)}
              toolbarConfig={descriptionToolbarConfig}
              plainTextPaste
              placeholder="Add-on description placeholder"
            />
          ) : null}
        </BlockStack>
      </Box>
    </Card>
  )
}
