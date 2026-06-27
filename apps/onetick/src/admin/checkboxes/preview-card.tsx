// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Box, Card, Icon, InlineStack, Link, Scrollable, Text } from '@shopify/polaris'
import { LightbulbIcon } from '@shopify/polaris-icons'
import { useEffect, useState } from 'react'
import { appendOneTickStaticCss } from '../../storefront/runtime-static-css'
import { defaultCheckboxStyling } from '../../domain/styling'
import { PLACEHOLDER_IMAGE, PreviewLayout } from './preview-layout'
import type { OneTickCheckboxFormState, OneTickCheckboxGlobalStyling, OneTickSetupResources } from './types'
import { selectedUpsellVariant, type OneTickSelectedVariant } from './selected-variant'
import { replaceOneTickPreviewDynamicFields } from './preview-dynamic-fields'

interface CheckboxPreviewCardProps {
  form: OneTickCheckboxFormState
  resources: OneTickSetupResources
  styling?: OneTickCheckboxGlobalStyling
  onOpenStyling?(): void
}

type OneTickPreviewVariant = NonNullable<OneTickSelectedVariant['product']['variants']>[number]

export const CheckboxPreviewCard: React.FC<CheckboxPreviewCardProps> = ({ form, resources, styling, onOpenStyling }) => {
  useEffect(() => appendOneTickStaticCss(document), [])
  const content = form.checkboxContent
  const variant = selectedUpsellVariant(form, resources)
  const [previewVariant, setPreviewVariant] = useState<OneTickPreviewVariant | null>(null)

  useEffect(() => {
    if (!variant) {
      setPreviewVariant(null)
      return
    }
    setPreviewVariant({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
    })
  }, [variant?.id, variant?.title, variant?.price, variant?.compareAtPrice])

  const showHeading = content.contentType === 'heading_only' || content.contentType === 'heading_and_description'
  const showDescription = content.contentType === 'description_only' || content.contentType === 'heading_and_description'
  const productTitle = variant?.product.title || ''
  const variants = variant?.product.variants || []
  const hasMultipleVariants = variants.length > 1 && !variant?.product.hasOnlyDefaultVariant
  const variantTitle = previewVariant?.title || variant?.title || ''
  const price = previewVariant?.price || variant?.price || '$0.00'
  const compareAtPrice = previewVariant?.compareAtPrice || variant?.compareAtPrice || ''
  const dynamicFieldValues = { productTitle, variantTitle, price, compareAtPrice }

  return (
    <BlockStack gap="200">
      <Card padding="0" roundedAbove="sm">
        <Box padding="400" borderBlockEndWidth="025" borderColor="border">
          <Text variant="headingMd" as="span">Preview add-on</Text>
        </Box>
        <Scrollable style={{ maxHeight: 'calc(100vh - 156px)' }}>
          {variant ? (
            <Box padding="400">
              <PreviewLayout
                heading={replaceOneTickPreviewDynamicFields(content.heading, dynamicFieldValues)}
                description={replaceOneTickPreviewDynamicFields(content.description, dynamicFieldValues)}
                showHeading={showHeading}
                showDescription={showDescription}
                showPrice={content.showPrice}
                showComparedPrice={content.showComparedPrice}
                price={price}
                compareAtPrice={compareAtPrice}
                showFeaturedImage={content.showFeaturedImage}
                showVariantSelector={content.showVariantSelector}
                showQuantitySelector={content.showQuantitySelector}
                showPersonalizeButton={content.showPersonalizeButton}
                showPopup={form.popup.showPopup}
                preCheck={content.preCheck}
                imageUrl={content.imageUrl || variant.product.featuredImage?.url || PLACEHOLDER_IMAGE}
                previewVariant={previewVariant}
                setPreviewVariant={setPreviewVariant}
                variants={variants}
                hasMultipleVariants={hasMultipleVariants}
                variantTitle={variantTitle}
                styling={styling || defaultCheckboxStyling}
              />
            </Box>
          ) : (
            <Box paddingBlockStart="1000" paddingBlockEnd="1000" paddingInlineStart="400" paddingInlineEnd="400">
              <Text as="span" variant="bodyMd" tone="subdued" alignment="center">
                Complete adding upsell details first to preview this widget here.
              </Text>
            </Box>
          )}
        </Scrollable>
      </Card>
      <Box borderRadius="200" padding="300">
        <InlineStack gap="200" wrap={false} align="center" blockAlign="center">
          <Box minWidth="20px" minHeight="20px">
            <Icon source={LightbulbIcon} tone="subdued" />
          </Box>
          <Text as="span" variant="bodySm" tone="subdued">
            By default, all add-on products are applied the same styles as defined in{' '}
            <Link onClick={onOpenStyling}>Styling</Link>
          </Text>
        </InlineStack>
      </Box>
    </BlockStack>
  )
}
