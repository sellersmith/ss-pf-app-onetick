// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { EmptyState, Text } from '@shopify/polaris'
import React from 'react'

export const TAILORKIT_EMPTY_TEMPLATE_IMAGE =
  'https://cdn.shopify.com/s/files/1/0704/8429/5925/files/Illustration_type.png?v=1721178074'

interface OneTickListEmptyStateProps {
  onCreate(): void
}

export const OneTickListEmptyState: React.FC<OneTickListEmptyStateProps> = ({ onCreate }) => (
  <EmptyState
    heading="No checkboxes created yet"
    image={TAILORKIT_EMPTY_TEMPLATE_IMAGE}
    action={{ content: 'Add add-on products', onAction: onCreate }}
  >
    <Text as="p" variant="bodyMd">
      Create your first checkbox to start tracking the performance.
    </Text>
  </EmptyState>
)
