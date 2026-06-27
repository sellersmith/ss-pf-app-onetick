// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type {
  OneTickCheckbox,
  OneTickCheckboxContent,
  OneTickCheckboxInput,
  OneTickPlacementType,
  OneTickPopup,
  OneTickTriggerProductsType,
  OneTickUpsellProduct,
} from '../../domain/checkbox'
import type { OneTickOnboardingState } from '../../domain/onboarding'
import type { OneTickCheckboxGlobalStyling } from '../../domain/styling'

export interface OneTickResourceOption {
  id: string
  title: string
  imageUrl?: string
  parentId?: string
  parentTitle?: string
  price?: string
  compareAtPrice?: string
  variants?: Array<{ id: string; title: string; price?: string; compareAtPrice?: string }>
}

export interface OneTickSetupResources {
  products: OneTickResourceOption[]
  variants: OneTickResourceOption[]
  collections: OneTickResourceOption[]
  tags: OneTickResourceOption[]
  vendors: OneTickResourceOption[]
  productTypes: OneTickResourceOption[]
}

export interface OneTickSetupOptions {
  triggerProductsTypes: OneTickTriggerProductsType[]
  placements: OneTickPlacementType[]
  resources: OneTickSetupResources
  limits: {
    currentCount: number
    upsellProductLimit: number | null
    limitReached: boolean
  }
}

export interface OneTickCheckboxListResponse {
  success: true
  items: OneTickCheckbox[]
}

export interface OneTickCheckboxDetailResponse {
  success: boolean
  item?: OneTickCheckbox
  message?: string
}

export interface OneTickSetupOptionsResponse extends OneTickSetupOptions {
  success: true
}

export interface OneTickCheckboxMutationResponse {
  success: boolean
  item?: OneTickCheckbox
  message?: string
}

export interface OneTickBulkResponse {
  success: boolean
  modifiedCount: number
  items: OneTickCheckbox[]
  message?: string
}

export interface OneTickStylingResponse {
  success: true
  styling: OneTickCheckboxGlobalStyling
}

export interface OneTickThemeConfig {
  isOS2Theme: boolean
  productThemeLink: string
  enabledAppEmbed: boolean
  enabledOneTickHelper: boolean
  themeEditCodeLink: string
  appEmbedLink: string
  oneTickHelperLink: string
  checkboxBlockLinkProduct: string
  checkboxBlockLinkCart: string
}

export interface OneTickThemeConfigResponse {
  success: true
  appConfig: OneTickThemeConfig
}

export interface OneTickOnboardingResponse {
  success: true
  onboarding: OneTickOnboardingState
}

export interface OneTickCheckboxFormState {
  title: string
  isActive: boolean
  typePlacement: OneTickPlacementType
  triggerProductsType: OneTickTriggerProductsType
  targetProducts: string[]
  excludeUpsellProducts: boolean
  excludeTriggerProductsType: OneTickTriggerProductsType | null
  excludeTriggerProducts: string[]
  upsellProducts: OneTickUpsellProduct[]
  canRemoveWhenTriggersCleared: boolean
  checkboxContent: OneTickCheckboxContent
  popup: OneTickPopup
  hideCartDrawer: boolean
}

export type OneTickCheckboxFormUpdater =
  | OneTickCheckboxFormState
  | ((current: OneTickCheckboxFormState) => OneTickCheckboxFormState)

export type OneTickValidationError = 'BLANK_TITLE' | 'NO_TRIGGER_PRODUCTS' | 'NO_ADDON_PRODUCT'

export type OneTickListAction = 'delete' | 'duplicate' | 'activate' | 'deactivate'

export type OneTickResourceKind = keyof OneTickSetupResources

export type OneTickResourceSearch = (kind: OneTickResourceKind, query: string) => Promise<OneTickResourceOption[]>

export type {
  OneTickCheckbox,
  OneTickCheckboxGlobalStyling,
  OneTickCheckboxInput,
  OneTickOnboardingState,
  OneTickPlacementType,
  OneTickTriggerProductsType,
}
