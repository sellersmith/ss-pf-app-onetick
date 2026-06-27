// OneTick onboarding UI mirrors TailorKit flow while using PageFly AdminAppHost and app API ports.
import { Banner, BlockStack, Box, Card, Icon, InlineStack, Spinner, Text } from '@shopify/polaris'
import { CheckCircleIcon } from '@shopify/polaris-icons'
import React, { useCallback, useState } from 'react'
import { openOneTickThemeHelper } from '../checkboxes/theme-helper-link'
import type { OneTickThemeConfig } from '../checkboxes/types'

interface EnableThemeHelperStepProps {
  themeConfig: OneTickThemeConfig
  isLoadingThemeConfig?: boolean
  onRefreshThemeConfig(): Promise<boolean>
  onOpenThemeHelperUnavailable?(): void
}

export const EnableThemeHelperStep: React.FC<EnableThemeHelperStepProps> = ({
  themeConfig,
  isLoadingThemeConfig,
  onRefreshThemeConfig,
  onOpenThemeHelperUnavailable,
}) => {
  const [buttonMode, setButtonMode] = useState<'enable' | 'check'>('enable')
  const [isChecking, setIsChecking] = useState(false)

  const enableThemeHelper = useCallback(() => {
    if (!openOneTickThemeHelper(themeConfig)) {
      onOpenThemeHelperUnavailable?.()
      return
    }
    window.setTimeout(() => setButtonMode('check'), 1000)
  }, [onOpenThemeHelperUnavailable, themeConfig])

  const checkThemeHelper = useCallback(async () => {
    setIsChecking(true)
    try {
      const isEnabled = await onRefreshThemeConfig()
      setButtonMode(isEnabled ? 'check' : 'enable')
    } finally {
      setIsChecking(false)
    }
  }, [onRefreshThemeConfig])

  if (isLoadingThemeConfig) {
    return (
      <Card padding="600">
        <InlineStack align="center" blockAlign="center" gap="400">
          <Spinner size="small" />
          <Text as="p" variant="bodyMd">Checking theme helper status</Text>
        </InlineStack>
      </Card>
    )
  }

  if (themeConfig.enabledOneTickHelper) {
    return (
      <Card padding="600">
        <BlockStack gap="300">
          <InlineStack gap="300" blockAlign="center">
            <Box>
              <Icon source={CheckCircleIcon} tone="success" />
            </Box>
            <Text as="h2" variant="headingMd">Theme helper is enabled</Text>
          </InlineStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            Your add-on products will display correctly on your storefront.
          </Text>
        </BlockStack>
      </Card>
    )
  }

  return (
    <Banner
      title="Theme helper is disabled"
      tone="info"
      action={{
        content: buttonMode === 'enable' ? 'Enable helper' : 'Check if enabled',
        onAction: buttonMode === 'enable' ? enableThemeHelper : checkThemeHelper,
        loading: isChecking,
      }}
    >
      <Text as="p" variant="bodyMd">
        Enable the theme helper to display add-on products on the storefront. Click the button, then save in Shopify theme editor.
      </Text>
    </Banner>
  )
}
