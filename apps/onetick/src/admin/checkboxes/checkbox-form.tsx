// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Banner, BlockStack, Grid } from '@shopify/polaris'
import React from 'react'
import { CheckboxPreviewCard } from './preview-card'
import { DisplayContentCard } from './display-content-card'
import { EnableThemeHelperBanner } from './enable-theme-helper-banner'
import { PlacementCard } from './placement-card'
import { PopupSettingsCard } from './popup-settings-card'
import { TriggerProductsCard } from './trigger-products-card'
import { UpsellProductCard } from './upsell-product-card'
import { WidgetConfigCard } from './widget-config-card'
import { selectedUpsellVariant } from './selected-variant'
import { mergeResourceOptions } from './resource-options'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxFormUpdater,
  OneTickCheckboxGlobalStyling,
  OneTickResourceOption,
  OneTickResourceSearch,
  OneTickSetupOptions,
  OneTickSetupResources,
  OneTickThemeConfig,
  OneTickValidationError,
} from './types'

interface OneTickCheckboxFormProps {
  form: OneTickCheckboxFormState
  fallbackTitle: string
  setup: OneTickSetupOptions
  styling?: OneTickCheckboxGlobalStyling
  themeConfig?: OneTickThemeConfig
  isLoadingThemeConfig?: boolean
  validationErrors?: OneTickValidationError[]
  onChange(next: OneTickCheckboxFormUpdater): void
  onSearchResources?: OneTickResourceSearch
  onRefreshThemeConfig?: () => Promise<boolean>
  onOpenThemeHelperUnavailable?(): void
  onOpenStyling(): void
}

const validationMessages = {
  BLANK_TITLE: 'Title is required.',
  NO_TRIGGER_PRODUCTS: 'Select at least one trigger source value.',
  NO_ADDON_PRODUCT: 'Add-on product is required.',
}

export const OneTickCheckboxForm: React.FC<OneTickCheckboxFormProps> = ({
  form,
  fallbackTitle,
  setup,
  styling,
  themeConfig,
  isLoadingThemeConfig,
  validationErrors = [],
  onChange,
  onSearchResources,
  onRefreshThemeConfig,
  onOpenThemeHelperUnavailable,
  onOpenStyling,
}) => {
  const [pickedVariantOptions, setPickedVariantOptions] = React.useState<OneTickResourceOption[]>([])
  const errors = validationErrors
  const titleError = errors.includes('BLANK_TITLE') ? validationMessages.BLANK_TITLE : undefined
  const triggerError = errors.includes('NO_TRIGGER_PRODUCTS') ? validationMessages.NO_TRIGGER_PRODUCTS : undefined
  const productError = errors.includes('NO_ADDON_PRODUCT') ? validationMessages.NO_ADDON_PRODUCT : undefined
  const resourcesWithPickedVariants: OneTickSetupResources = {
    ...setup.resources,
    variants: mergeResourceOptions(setup.resources.variants, pickedVariantOptions),
  }
  const selectedVariantData = selectedUpsellVariant(form, resourcesWithPickedVariants)
  const hideAllProductsOption = typeof setup.limits.upsellProductLimit === 'number'

  return (
    <BlockStack gap="400">
      {themeConfig && onRefreshThemeConfig ? (
        <EnableThemeHelperBanner
          themeConfig={themeConfig}
          isLoadingThemeConfig={isLoadingThemeConfig}
          onRefreshThemeConfig={onRefreshThemeConfig}
          onOpenThemeHelperUnavailable={onOpenThemeHelperUnavailable}
        />
      ) : null}
      {errors.length ? (
        <Banner tone="critical" title="Fix errors before saving">
          <BlockStack gap="100">
            {errors.map(error => (
              <span key={error}>{validationMessages[error]}</span>
            ))}
          </BlockStack>
        </Banner>
      ) : null}
      <Grid gap={{ xs: '400' }}>
        <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
          <BlockStack gap="400">
            <WidgetConfigCard form={form} titleError={titleError} fallbackTitle={fallbackTitle} onChange={onChange} />
            <PlacementCard form={form} onChange={onChange} />
            <TriggerProductsCard
              form={form}
              resources={setup.resources}
              hideAllProductsOption={hideAllProductsOption}
              error={triggerError}
              onChange={onChange}
              onSearchResources={onSearchResources}
            />
            <UpsellProductCard
              form={form}
              resources={resourcesWithPickedVariants}
              error={productError}
              onChange={onChange}
              onSearchResources={onSearchResources}
              onPickedVariantsChange={setPickedVariantOptions}
            />
            <DisplayContentCard form={form} selectedVariantData={selectedVariantData} onChange={onChange} />
            <PopupSettingsCard form={form} onChange={onChange} />
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
    </BlockStack>
  )
}
