// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Box, Button, InlineGrid, Modal, Scrollable, Tabs, Text } from '@shopify/polaris'
import React, { memo, useCallback, useState } from 'react'
import type { OneTickPlacementType } from './types'

const INSTALL_ONETICK_APP_BLOCK_VIDEO = 'https://cdn.shopify.com/videos/c/o/v/6e5b40b735db4dce9d5dd9b92e29e245.mov'
const INSTALL_ONETICK_APP_BLOCK_POSTER =
  'https://cdn.shopify.com/s/files/1/0704/8429/5925/files/9ff19694d74987eb13798cd027c89a4865fbb458.png?v=1750385611'

const liquidCode = `{% if section.settings.product %}
  {% assign product = section.settings.product %}
{% endif %}

{% assign currentProduct = product.id | append: '' %}
{% assign currentProductTitle = product.title | append: '' %}

<onetick-group-checkboxes
  data-onetick-theme-code="true"
  data-target-product="{{ currentProduct }}"
  data-target-product-title="{{ currentProductTitle }}"
></onetick-group-checkboxes>`

interface InstallCheckboxModalProps {
  open: boolean
  typePlacement?: OneTickPlacementType
  checkboxBlockLinkProduct?: string
  checkboxBlockLinkCart?: string
  onClose(): void
  onContactSupport(): void
  onCodeCopied?(): void
}

const OS2ThemeTab = memo(function OS2ThemeTab({
  typePlacement,
  checkboxBlockLinkProduct,
  checkboxBlockLinkCart,
}: {
  typePlacement?: OneTickPlacementType
  checkboxBlockLinkProduct?: string
  checkboxBlockLinkCart?: string
}) {
  const checkboxBlockLink = typePlacement === 'cart' ? checkboxBlockLinkCart : checkboxBlockLinkProduct
  const placementNote =
    typePlacement === 'cart'
      ? 'OneTick add-on product blocks must be placed inside the cart page.'
      : 'OneTick add-on product blocks must be placed inside the product section.'

  const goToThemeEditor = useCallback(() => {
    if (checkboxBlockLink) window.open(checkboxBlockLink, '_blank', 'noopener,noreferrer')
  }, [checkboxBlockLink])

  return (
    <InlineGrid columns={{ xs: 1, sm: 1, md: '1.2fr 1fr' }} gap="400">
      <Box minHeight="316px">
        <video
          controls
          autoPlay
          style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
          poster={INSTALL_ONETICK_APP_BLOCK_POSTER}
        >
          <source src={INSTALL_ONETICK_APP_BLOCK_VIDEO} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </Box>
      <Box paddingBlockEnd="400" paddingBlockStart="400">
        <BlockStack gap="400">
          <Text as="span" variant="bodyMd">
            To add add-on products on Online Store 2.0 themes, go to Shopify theme editor and click{' '}
            <Text as="span" variant="bodyMd" fontWeight="bold">
              {'Add block > Apps > OneTick add-on products'}
            </Text>
            .
          </Text>
          <Text as="span" variant="bodyMd">
            {placementNote}
          </Text>
          <Button variant="primary" onClick={goToThemeEditor}>
            Go to theme editor
          </Button>
        </BlockStack>
      </Box>
    </InlineGrid>
  )
})

const VintageThemeTab = memo(function VintageThemeTab({ onCodeCopied }: { onCodeCopied?(): void }) {
  const [copying, setCopying] = useState(false)

  const copyCode = useCallback(async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(liquidCode)
      onCodeCopied?.()
    } finally {
      setCopying(false)
    }
  }, [onCodeCopied])

  return (
    <InlineGrid columns={{ xs: 1, sm: 1, md: '1.2fr 1fr' }} gap="400">
      <Box padding="300" minHeight="316px" background="bg-surface-secondary" borderRadius="300">
        <Scrollable style={{ height: '292px' }}>
          <Text as="span" variant="bodyMd" breakWord>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>{liquidCode}</pre>
          </Text>
        </Scrollable>
      </Box>
      <Box paddingBlockEnd="400" paddingBlockStart="400">
        <BlockStack gap="400">
          <Text as="span" variant="bodyMd">
            Copy and paste this code snippet to embed OneTick add-on products into vintage themes or page builders.
          </Text>
          <Button variant="primary" loading={copying} onClick={copyCode}>
            Copy code
          </Button>
        </BlockStack>
      </Box>
    </InlineGrid>
  )
})

const ModalContent = memo(function ModalContent({
  typePlacement,
  checkboxBlockLinkProduct,
  checkboxBlockLinkCart,
  onCodeCopied,
}: Omit<InstallCheckboxModalProps, 'open' | 'onClose' | 'onContactSupport'>) {
  const [selectedTab, setSelectedTab] = useState(0)
  const tabs = [
    { id: 'OS2-theme', content: 'OS 2.0 theme', accessibilityLabel: 'OS 2.0 theme', panelID: 'OS2-theme' },
    { id: 'vintage-theme', content: 'Vintage themes and page builders', panelID: 'vintage-theme' },
  ]

  return (
    <>
      <Box padding="200" borderBlockEndWidth="025" borderColor="border">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
      </Box>
      <Box padding="400">
        {selectedTab === 0 ? (
          <OS2ThemeTab
            typePlacement={typePlacement}
            checkboxBlockLinkProduct={checkboxBlockLinkProduct}
            checkboxBlockLinkCart={checkboxBlockLinkCart}
          />
        ) : (
          <VintageThemeTab onCodeCopied={onCodeCopied} />
        )}
      </Box>
    </>
  )
})

export const InstallCheckboxModal: React.FC<InstallCheckboxModalProps> = ({
  open,
  typePlacement,
  checkboxBlockLinkProduct,
  checkboxBlockLinkCart,
  onClose,
  onContactSupport,
  onCodeCopied,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Install add-on products"
    secondaryActions={[{ content: 'Close', onAction: onClose }]}
    size="large"
    footer={
      <Text as="span" variant="bodyMd">
        Having trouble installing OneTick add-on products?{' '}
        <Button variant="plain" onClick={onContactSupport}>
          Contact support
        </Button>
      </Text>
    }
  >
    <ModalContent
      typePlacement={typePlacement}
      checkboxBlockLinkProduct={checkboxBlockLinkProduct}
      checkboxBlockLinkCart={checkboxBlockLinkCart}
      onCodeCopied={onCodeCopied}
    />
  </Modal>
)
