// OneTick onboarding UI mirrors TailorKit flow while using PageFly AdminAppHost and app API ports.
import { BlockStack, Page } from '@shopify/polaris'
import React, { useEffect, useMemo, useState } from 'react'
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import { createOneTickAdminApi } from '../checkboxes/api'
import { emptySetupOptions, emptyThemeConfig } from '../checkboxes/default-setup'
import { cloneDefaultFormState, formStateToCheckboxInput, validateFormState } from '../checkboxes/form-state'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxGlobalStyling,
  OneTickOnboardingState,
  OneTickResourceKind,
  OneTickSetupOptions,
  OneTickThemeConfig,
} from '../checkboxes/types'
import { BasicSetupStep } from './basic-setup-step'
import { EnableThemeHelperStep } from './enable-theme-helper-step'
import { OnboardingFooter } from './onboarding-footer'
import { ShareKnowledgeStep } from './share-knowledge-step'

interface OneTickOnboardingScreenProps {
  host: AdminAppHost
}

const titles = {
  shareKnowledge: ['Know your customers well', "Something we don't see many people talk about."],
  basicSetup: ['Create your first add-on', 'Select a product to offer as an add-on.'],
  enableThemeHelper: ['Enable OneTick surfaces', 'Final step to display your add-on products.'],
  complete: ['Onboarding complete', 'OneTick is ready.'],
}

function withDefaultHeading(form: OneTickCheckboxFormState): OneTickCheckboxFormState {
  if (form.checkboxContent.heading.trim()) return form
  return { ...form, checkboxContent: { ...form.checkboxContent, heading: '<p>Add this item</p>' } }
}

export const OneTickOnboardingScreen: React.FC<OneTickOnboardingScreenProps> = ({ host }) => {
  const api = useMemo(() => createOneTickAdminApi(host), [host])
  const [onboarding, setOnboarding] = useState<OneTickOnboardingState>({ currentStep: 'shareKnowledge', completed: false, skipped: false, updatedAt: '' })
  const [form, setForm] = useState<OneTickCheckboxFormState>(cloneDefaultFormState)
  const [setup, setSetup] = useState<OneTickSetupOptions>(emptySetupOptions)
  const [styling, setStyling] = useState<OneTickCheckboxGlobalStyling | undefined>()
  const [themeConfig, setThemeConfig] = useState<OneTickThemeConfig>(emptyThemeConfig)
  const [isLoadingThemeConfig, setIsLoadingThemeConfig] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, subtitle] = titles[onboarding.currentStep]
  const isLastStep = onboarding.currentStep === 'enableThemeHelper'
  const showSkip = isLastStep && !themeConfig.enabledOneTickHelper
  const primaryLabel = isLastStep
    ? 'Finish'
    : onboarding.currentStep === 'basicSetup' ? 'Create and continue' : 'Continue'

  useEffect(() => {
    Promise.all([api.loadOnboarding(), api.loadSetupOptions(), api.loadStyling(), api.loadThemeConfig()])
      .then(([onboardingResponse, setupResponse, stylingResponse, themeConfigResponse]) => {
        setOnboarding(onboardingResponse.onboarding)
        setSetup(setupResponse)
        setStyling(stylingResponse.styling)
        setThemeConfig(themeConfigResponse.appConfig)
        setForm(currentForm => (
          typeof setupResponse.limits.upsellProductLimit === 'number'
            && currentForm.triggerProductsType === 'all-products'
            ? { ...currentForm, triggerProductsType: 'specific-products', targetProducts: [] }
            : currentForm
        ))
      })
      .catch(error => {
        host.ports.notifications.show('Cannot load OneTick onboarding.', 'critical')
        console.error('[OneTick] Cannot load onboarding', error)
      })
      .finally(() => setIsLoadingThemeConfig(false))
  }, [api, host])

  const persist = async (next: Partial<OneTickOnboardingState>) => {
    const response = await api.saveOnboarding(next)
    setOnboarding(response.onboarding)
  }

  const refreshThemeConfig = async () => {
    const response = await api.loadThemeConfig()
    setThemeConfig(response.appConfig)
    return response.appConfig.enabledOneTickHelper
  }
  const notifyThemeHelperUnavailable = () => {
    host.ports.notifications.show('Cannot open OneTick theme helper. Theme editor link is unavailable.', 'critical')
  }
  const searchResources = async (kind: OneTickResourceKind, query: string) => (
    (await api.loadSetupOptions(query)).resources[kind] || []
  )

  const primary = async () => {
    setSaving(true)
    try {
      if (onboarding.currentStep === 'shareKnowledge') await persist({ currentStep: 'basicSetup' })
      if (onboarding.currentStep === 'basicSetup') {
        const nextForm = withDefaultHeading(form)
        const blockingErrors = validateFormState(nextForm)
        if (blockingErrors.length) throw new Error('Select trigger products and an add-on product first.')
        await api.createCheckbox(formStateToCheckboxInput(nextForm))
        await persist({ currentStep: 'enableThemeHelper', checkboxDraft: formStateToCheckboxInput(nextForm) })
      }
      if (onboarding.currentStep === 'enableThemeHelper') {
        await persist({ currentStep: 'complete', completed: true })
        host.ports.navigation.navigate(host.routeBase)
      }
    } catch (error) {
      host.ports.notifications.show(error instanceof Error ? error.message : 'Cannot save onboarding.', 'critical')
    } finally {
      setSaving(false)
    }
  }

  const skip = async () => {
    await persist({ currentStep: 'complete', completed: true, skipped: true })
    host.ports.navigation.navigate(host.routeBase)
  }

  return (
    <Page title={title} subtitle={subtitle} backAction={{ content: 'Add-on products', onAction: () => host.ports.navigation.navigate(host.routeBase) }} fullWidth>
      <BlockStack gap="300">
        {onboarding.currentStep === 'shareKnowledge' ? <ShareKnowledgeStep /> : null}
        {onboarding.currentStep === 'basicSetup' ? (
          <BasicSetupStep
            form={form}
            setup={setup}
            styling={styling}
            onChange={setForm}
            onSearchResources={searchResources}
            onOpenStyling={() => host.ports.navigation.navigate(`${host.routeBase}/styling`)}
          />
        ) : null}
        {onboarding.currentStep === 'enableThemeHelper' ? (
          <EnableThemeHelperStep
            themeConfig={themeConfig}
            isLoadingThemeConfig={isLoadingThemeConfig}
            onRefreshThemeConfig={refreshThemeConfig}
            onOpenThemeHelperUnavailable={notifyThemeHelperUnavailable}
          />
        ) : null}
        <OnboardingFooter
          primaryLabel={primaryLabel}
          showSkip={showSkip}
          loading={saving}
          onPrimary={primary}
          onSkip={skip}
        />
      </BlockStack>
    </Page>
  )
}
