// OneTick onboarding UI mirrors TailorKit flow while using PageFly AdminAppHost and app API ports.
import { Box, Button, ButtonGroup, InlineStack } from '@shopify/polaris'
import React from 'react'

interface OnboardingFooterProps {
  primaryLabel: string
  showSkip?: boolean
  loading?: boolean
  onPrimary(): void
  onSkip?(): void
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  primaryLabel,
  showSkip = false,
  loading,
  onPrimary,
  onSkip,
}) => (
  <Box paddingBlockStart="200">
    <InlineStack align="end">
      <ButtonGroup>
        {showSkip ? (
          <Button onClick={onSkip} variant="tertiary" disabled={loading}>
            Skip
          </Button>
        ) : null}
        <Button variant="primary" loading={loading} disabled={loading} onClick={onPrimary}>{primaryLabel}</Button>
      </ButtonGroup>
    </InlineStack>
  </Box>
)
