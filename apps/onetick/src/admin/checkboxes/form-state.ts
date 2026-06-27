// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { OneTickCheckbox, OneTickCheckboxFormState, OneTickCheckboxInput, OneTickValidationError } from './types'

export const defaultCheckboxContent: OneTickCheckboxFormState['checkboxContent'] = {
  contentType: 'heading_only',
  heading: '',
  description: '',
  imageUrl: '',
  showPrice: false,
  showComparedPrice: false,
  preCheck: false,
  showVariantSelector: false,
  showFeaturedImage: true,
  showQuantitySelector: false,
  showPersonalizeButton: false,
}

export const defaultPopup: OneTickCheckboxFormState['popup'] = {
  showPopup: false,
  heading: 'This is your popup heading.',
  description: 'This is your popup description.',
}

export const defaultFormState: OneTickCheckboxFormState = {
  title: 'Upsell campaign',
  isActive: true,
  typePlacement: 'product_details',
  triggerProductsType: 'all-products',
  targetProducts: [],
  excludeUpsellProducts: false,
  excludeTriggerProductsType: null,
  excludeTriggerProducts: [],
  upsellProducts: [],
  canRemoveWhenTriggersCleared: true,
  checkboxContent: defaultCheckboxContent,
  popup: defaultPopup,
  hideCartDrawer: false,
}

/** Maps persisted checkbox data into the TailorKit-parity editor state with legacy-safe fallbacks. */
export function checkboxToFormState(checkbox: OneTickCheckbox): OneTickCheckboxFormState {
  return {
    title: checkbox.title || '',
    isActive: checkbox.isActive ?? false,
    typePlacement: checkbox.typePlacement || 'product_details',
    triggerProductsType: checkbox.triggerProductsType || 'all-products',
    targetProducts: checkbox.targetProducts || [],
    excludeUpsellProducts: checkbox.excludeUpsellProducts ?? false,
    excludeTriggerProductsType: checkbox.excludeTriggerProductsType || null,
    excludeTriggerProducts: checkbox.excludeTriggerProducts || [],
    upsellProducts: checkbox.upsellProducts || [],
    canRemoveWhenTriggersCleared: checkbox.canRemoveWhenTriggersCleared ?? false,
    checkboxContent: {
      contentType: checkbox.checkboxContent?.contentType || 'heading_only',
      heading: checkbox.checkboxContent?.heading || '',
      description: checkbox.checkboxContent?.description || '',
      imageUrl: checkbox.checkboxContent?.imageUrl || '',
      showPrice: checkbox.checkboxContent?.showPrice ?? true,
      showComparedPrice: checkbox.checkboxContent?.showComparedPrice ?? false,
      preCheck: checkbox.checkboxContent?.preCheck ?? false,
      showVariantSelector: checkbox.checkboxContent?.showVariantSelector ?? false,
      showFeaturedImage: checkbox.checkboxContent?.showFeaturedImage ?? true,
      showQuantitySelector: checkbox.checkboxContent?.showQuantitySelector ?? false,
      showPersonalizeButton: checkbox.checkboxContent?.showPersonalizeButton ?? false,
    },
    popup: {
      showPopup: checkbox.popup?.showPopup ?? false,
      heading: checkbox.popup?.heading || '',
      description: checkbox.popup?.description || '',
    },
    hideCartDrawer: checkbox.hideCartDrawer ?? false,
  }
}

/** Converts editor state back to the app API payload without leaking transient UI-only data. */
export function formStateToCheckboxInput(formState: OneTickCheckboxFormState): OneTickCheckboxInput {
  return {
    title: formState.title,
    isActive: formState.isActive,
    typePlacement: formState.typePlacement,
    triggerProductsType: formState.triggerProductsType,
    targetProducts: formState.targetProducts,
    excludeUpsellProducts: formState.excludeUpsellProducts,
    excludeTriggerProductsType: formState.excludeTriggerProductsType,
    excludeTriggerProducts: formState.excludeTriggerProducts,
    upsellProducts: formState.upsellProducts,
    canRemoveWhenTriggersCleared: formState.canRemoveWhenTriggersCleared,
    checkboxContent: formState.checkboxContent,
    popup: formState.popup,
    hideCartDrawer: formState.hideCartDrawer,
  }
}

export function validateFormState(formState: OneTickCheckboxFormState): OneTickValidationError[] {
  const errors: OneTickValidationError[] = []
  if (!formState.title.trim()) errors.push('BLANK_TITLE')
  if (formState.triggerProductsType !== 'all-products' && !formState.targetProducts.length) errors.push('NO_TRIGGER_PRODUCTS')
  if (!formState.upsellProducts.length) errors.push('NO_ADDON_PRODUCT')
  return errors
}

/** Returns a fresh mutable draft; nested defaults must not be shared between create/edit screens. */
export function cloneDefaultFormState(): OneTickCheckboxFormState {
  return {
    ...defaultFormState,
    checkboxContent: { ...defaultCheckboxContent },
    popup: { ...defaultPopup },
    targetProducts: [],
    excludeTriggerProducts: [],
    upsellProducts: [],
  }
}
