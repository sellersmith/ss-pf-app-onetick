// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import { BlockStack, Box, Card, Scrollable, Text } from '@shopify/polaris'
import React, { useEffect, useState } from 'react'
import { appendOneTickStaticCss } from '../../storefront/runtime-static-css'
import { PreviewLayout } from '../checkboxes/preview-layout'
import type { OneTickPreviewVariant } from '../checkboxes/preview-variant-selector'
import type { OneTickCheckboxGlobalStyling } from '../checkboxes/types'

interface StylingPreviewProps {
  styling: OneTickCheckboxGlobalStyling
}

const demoVariant = {
  id: 'gid://shopify/ProductVariant/demo',
  title: 'Default Title',
  price: '$100.00',
  compareAtPrice: '$125.00',
  product: {
    id: 'gid://shopify/Product/demo',
    title: 'Demo add-on product',
    featuredImage: { url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png' },
    hasOnlyDefaultVariant: true,
    variants: [{ id: 'gid://shopify/ProductVariant/demo', title: 'Default Title', price: '$100.00', compareAtPrice: '$125.00' }],
  },
}

export const StylingPreview: React.FC<StylingPreviewProps> = ({ styling }) => {
  useEffect(() => appendOneTickStaticCss(document), [])
  const [isChecked] = useState(true)
  const [previewVariant, setPreviewVariant] = useState<OneTickPreviewVariant | null>(demoVariant)
  const price = previewVariant?.price || demoVariant.price
  const compareAtPrice = previewVariant?.compareAtPrice || demoVariant.compareAtPrice

  return (
    <BlockStack gap="200">
      <Card padding="0">
        <Box padding="400" borderBlockEndWidth="025" borderColor="border">
          <Text variant="headingMd" as="span">Preview add-on</Text>
        </Box>
        <Scrollable style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Box padding="400">
            <PreviewLayout
              heading="Demo heading"
              description="This is a demo description"
              showHeading
              showDescription
              showPrice
              showComparedPrice
              showFeaturedImage
              showVariantSelector={false}
              showQuantitySelector={false}
              showPersonalizeButton={false}
              showPopup={false}
              preCheck={isChecked}
              imageUrl={demoVariant.product.featuredImage.url}
              price={price}
              compareAtPrice={compareAtPrice}
              previewVariant={previewVariant}
              setPreviewVariant={setPreviewVariant}
              variants={demoVariant.product.variants}
              hasMultipleVariants={false}
              variantTitle={previewVariant?.title || demoVariant.title}
              styling={styling}
            />
          </Box>
        </Scrollable>
      </Card>
      <Box padding="300">
        <Text as="span" variant="bodySm" tone="subdued">All add-on products will adopt this style.</Text>
      </Box>
    </BlockStack>
  )
}
