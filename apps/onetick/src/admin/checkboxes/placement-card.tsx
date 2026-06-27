// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Box, Card, Checkbox, ChoiceList, Text } from '@shopify/polaris'
import React from 'react'
import type { OneTickCheckboxFormState, OneTickCheckboxFormUpdater, OneTickPlacementType } from './types'

interface PlacementCardProps {
  form: OneTickCheckboxFormState
  onChange(next: OneTickCheckboxFormUpdater): void
}

const choices = [
  { label: 'Product details', value: 'product_details', helpText: 'Add add-on inside product details on any page.' },
  { label: 'Cart', value: 'cart', helpText: 'Add add-on in both cart drawer and/or cart page.' },
]

export const PlacementCard: React.FC<PlacementCardProps> = ({ form, onChange }) => {
  const placement = form.typePlacement === 'product_page' ? 'product_details' : form.typePlacement

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">Placement</Text>
          <Text as="p" variant="bodyMd">Choose where your add-on will be displayed.</Text>
        </BlockStack>
        <ChoiceList
          title="Placement"
          titleHidden
          choices={choices}
          selected={[placement]}
          onChange={selected => onChange(current => ({ ...current, typePlacement: selected[0] as OneTickPlacementType }))}
        />
        {placement === 'cart' ? (
          <Box>
            <Checkbox
              label="Hide in cart drawer"
              checked={form.hideCartDrawer}
              onChange={hideCartDrawer => onChange(current => ({ ...current, hideCartDrawer }))}
            />
          </Box>
        ) : null}
      </BlockStack>
    </Card>
  )
}
