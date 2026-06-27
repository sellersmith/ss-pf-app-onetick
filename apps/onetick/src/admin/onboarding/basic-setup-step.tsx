// OneTick onboarding UI mirrors TailorKit flow while using PageFly AdminAppHost and app API ports.
import { BlockStack, Grid } from '@shopify/polaris'
import React from 'react'
import { CheckboxPreviewCard } from '../checkboxes/preview-card'
import { mergeResourceOptions } from '../checkboxes/resource-options'
import { TriggerProductsCard } from '../checkboxes/trigger-products-card'
import { UpsellProductCard } from '../checkboxes/upsell-product-card'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxGlobalStyling,
  OneTickResourceOption,
  OneTickResourceSearch,
  OneTickSetupOptions,
  OneTickSetupResources,
} from '../checkboxes/types'

interface BasicSetupStepProps {
  form: OneTickCheckboxFormState
  setup: OneTickSetupOptions
  styling?: OneTickCheckboxGlobalStyling
  onChange(next: OneTickCheckboxFormState): void
  onSearchResources?: OneTickResourceSearch
  onOpenStyling(): void
}

export const BasicSetupStep: React.FC<BasicSetupStepProps> = ({
  form,
  setup,
  styling,
  onChange,
  onSearchResources,
  onOpenStyling,
}) => {
  const [pickedVariantOptions, setPickedVariantOptions] = React.useState<OneTickResourceOption[]>([])
  const resourcesWithPickedVariants: OneTickSetupResources = {
    ...setup.resources,
    variants: mergeResourceOptions(setup.resources.variants, pickedVariantOptions),
  }
  const hideAllProductsOption = typeof setup.limits.upsellProductLimit === 'number'

  return (
    <Grid gap={{ xs: '400' }}>
      <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
        <BlockStack gap="400">
          <TriggerProductsCard
            form={form}
            resources={setup.resources}
            hideAllProductsOption={hideAllProductsOption}
            onChange={onChange}
            onSearchResources={onSearchResources}
          />
          <UpsellProductCard
            form={form}
            resources={resourcesWithPickedVariants}
            onChange={onChange}
            onSearchResources={onSearchResources}
            onPickedVariantsChange={setPickedVariantOptions}
          />
        </BlockStack>
      </Grid.Cell>
      <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
        <div className="ot-sticky-preview-card">
          <CheckboxPreviewCard
            form={form}
            resources={resourcesWithPickedVariants}
            styling={styling}
            onOpenStyling={onOpenStyling}
          />
        </div>
      </Grid.Cell>
    </Grid>
  )
}
