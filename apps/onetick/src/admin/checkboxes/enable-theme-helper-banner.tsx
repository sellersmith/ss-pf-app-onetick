// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Banner, Box } from '@shopify/polaris'
import React, { useCallback, useState } from 'react'
import { openOneTickThemeHelper } from './theme-helper-link'
import type { OneTickThemeConfig } from './types'

interface EnableThemeHelperBannerProps {
  themeConfig: OneTickThemeConfig
  isLoadingThemeConfig?: boolean
  onRefreshThemeConfig(): Promise<boolean>
  onOpenThemeHelperUnavailable?(): void
}

export const EnableThemeHelperBanner: React.FC<EnableThemeHelperBannerProps> = ({
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

  const checkHelperEnabled = useCallback(async () => {
    setIsChecking(true)
    try {
      const isEnabled = await onRefreshThemeConfig()
      if (!isEnabled) setButtonMode('enable')
    } finally {
      setIsChecking(false)
    }
  }, [onRefreshThemeConfig])

  if (isLoadingThemeConfig || themeConfig.enabledOneTickHelper) return null

  return (
    <Box paddingBlockEnd="400">
      <Banner
        title="Upsell/cross-sell helper is disabled"
        tone="warning"
        action={{
          content: buttonMode === 'enable' ? 'Enable helper' : 'Check helper enabled',
          onAction: buttonMode === 'enable' ? enableThemeHelper : checkHelperEnabled,
          loading: isChecking,
        }}
      >
        Please enable the OneTick theme helper to display add-on products properly.
      </Banner>
    </Box>
  )
}
