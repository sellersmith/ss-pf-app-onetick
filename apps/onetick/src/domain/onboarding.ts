// OneTick domain models are app-owned persisted shapes plus explicit storefront compatibility formatters.
import type { OneTickCheckboxInput } from './checkbox'

export type OneTickOnboardingStep = 'shareKnowledge' | 'basicSetup' | 'enableThemeHelper' | 'complete'

export interface OneTickOnboardingState {
  currentStep: OneTickOnboardingStep
  completed: boolean
  skipped: boolean
  checkboxDraft?: OneTickCheckboxInput
  updatedAt: string
}

export const defaultOnboardingState: OneTickOnboardingState = {
  currentStep: 'shareKnowledge',
  completed: false,
  skipped: false,
  updatedAt: new Date(0).toISOString(),
}

/** Keeps onboarding state forward-compatible when older app data has only a subset of fields. */
export function mergeOnboardingState(input?: Partial<OneTickOnboardingState>): OneTickOnboardingState {
  return {
    ...defaultOnboardingState,
    ...(input || {}),
    updatedAt: new Date().toISOString(),
  }
}
