// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { Badge, BlockStack, Card, Page, SkeletonBodyText } from '@shopify/polaris'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import { createOneTickAdminApi } from './api'
import { OneTickCheckboxForm } from './checkbox-form'
import { OneTickContextualSaveBar } from './contextual-save-bar'
import { emptySetupOptions, emptyThemeConfig } from './default-setup'
import { checkboxToFormState, cloneDefaultFormState, formStateToCheckboxInput, validateFormState } from './form-state'
import { InstallCheckboxModal } from './install-checkbox-modal'
import type {
  OneTickCheckboxFormState,
  OneTickCheckboxFormUpdater,
  OneTickCheckboxGlobalStyling,
  OneTickResourceKind,
  OneTickSetupOptions,
  OneTickThemeConfig,
  OneTickValidationError,
} from './types'

interface OneTickCheckboxEditorScreenProps {
  host: AdminAppHost
}

function truncateTitle(title: string): string {
  return title.length <= 25 ? title : `${title.substring(0, 25)}...`
}

export const OneTickCheckboxEditorScreen: React.FC<OneTickCheckboxEditorScreenProps> = ({ host }) => {
  const { id } = useParams()
  const api = useMemo(() => createOneTickAdminApi(host), [host])
  const [form, setForm] = useState<OneTickCheckboxFormState>(cloneDefaultFormState)
  const [baselineForm, setBaselineForm] = useState<OneTickCheckboxFormState>(cloneDefaultFormState)
  const [setup, setSetup] = useState<OneTickSetupOptions>(emptySetupOptions)
  const [themeConfig, setThemeConfig] = useState<OneTickThemeConfig>(emptyThemeConfig)
  const [styling, setStyling] = useState<OneTickCheckboxGlobalStyling | undefined>()
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<OneTickValidationError[]>([])
  const [loading, setLoading] = useState(true)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)
  const isDirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baselineForm), [baselineForm, form])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [item, setupOptions, stylingResponse, themeConfigResponse] = await Promise.all([
        id ? api.loadCheckbox(id) : Promise.resolve(null),
        api.loadSetupOptions(),
        api.loadStyling(),
        api.loadThemeConfig(),
      ])
      setSetup(setupOptions)
      setStyling(stylingResponse.styling)
      setThemeConfig(themeConfigResponse.appConfig)
      const loadedForm = item ? checkboxToFormState(item) : cloneDefaultFormState()
      const nextForm: OneTickCheckboxFormState =
        typeof setupOptions.limits.upsellProductLimit === 'number' && loadedForm.triggerProductsType === 'all-products'
          ? { ...loadedForm, triggerProductsType: 'specific-products', targetProducts: [] }
          : loadedForm
      setForm(nextForm)
      setBaselineForm(nextForm)
      setValidationErrors([])
    } finally {
      setLoading(false)
    }
  }, [api, id])

  useEffect(() => {
    load().catch(error => {
      host.ports.notifications.show('Cannot load OneTick add-on product.', 'critical')
      console.error('[OneTick] Cannot load editor', error)
    })
  }, [host, load])

  const searchResources = useCallback(
    async (kind: OneTickResourceKind, query: string) => {
      return (await api.loadSetupOptions(query)).resources[kind] || []
    },
    [api]
  )

  const updateForm = useCallback((next: OneTickCheckboxFormUpdater) => {
    setForm(current => {
      const nextForm = typeof next === 'function' ? next(current) : next
      return nextForm
    })
  }, [])

  const save = useCallback(async () => {
    const nextValidationErrors = validateFormState(form)
    if (nextValidationErrors.length) {
      setValidationErrors(nextValidationErrors)
      return
    }
    setValidationErrors([])
    setSaving(true)
    try {
      const input = formStateToCheckboxInput(form)
      const response = id ? await api.updateCheckbox(id, input) : await api.createCheckbox(input)
      if (!response.success) throw new Error(response.message || 'Cannot save OneTick add-on product')
      const nextForm = response.item ? checkboxToFormState(response.item) : form
      setForm(nextForm)
      setBaselineForm(nextForm)
      host.ports.notifications.show('OneTick add-on product saved.', 'success')
      host.ports.tracking.track('checkbox_saved', { checkboxId: response.item?.id, editing: Boolean(id) })
      if (!id && response.item?.id) {
        host.ports.navigation.navigate(`${host.routeBase}/edit/${response.item.id}`)
      }
    } catch (error) {
      host.ports.notifications.show('Cannot save OneTick add-on product.', 'critical')
      console.error('[OneTick] Cannot save editor', error)
    } finally {
      setSaving(false)
    }
  }, [api, form, host, id])

  const discard = useCallback(() => {
    setForm(baselineForm)
    setValidationErrors([])
  }, [baselineForm])
  const refreshThemeConfig = useCallback(async () => {
    const response = await api.loadThemeConfig()
    setThemeConfig(response.appConfig)
    if (!response.appConfig.enabledOneTickHelper) {
      host.ports.notifications.show('OneTick theme helper is not enabled yet.', 'critical')
    }
    return response.appConfig.enabledOneTickHelper
  }, [api, host])
  const notifyThemeHelperUnavailable = useCallback(() => {
    host.ports.notifications.show('Cannot open OneTick theme helper. Theme editor link is unavailable.', 'critical')
  }, [host])
  const openInstallGuide = useCallback(() => setInstallGuideOpen(true), [])
  const closeInstallGuide = useCallback(() => setInstallGuideOpen(false), [])
  const contactSupport = useCallback(() => {
    closeInstallGuide()
    host.ports.support.openChat()
  }, [closeInstallGuide, host])
  const editorTitle = id ? (loading ? 'Add-on product' : truncateTitle(form.title)) : 'Add add-on product'

  return (
    <>
      <OneTickContextualSaveBar isOpen={isDirty} loading={saving} onSave={save} onDiscard={discard} />
      <Page
        title={editorTitle}
        subtitle={id ? `Widget ID: ${id}` : undefined}
        titleMetadata={form.isActive ? <Badge tone="success">Active</Badge> : <Badge>Draft</Badge>}
        backAction={{ content: 'Add-on products', onAction: () => host.ports.navigation.navigate(host.routeBase) }}
        secondaryActions={
          id
            ? [
                {
                  content: 'View installation guide',
                  accessibilityLabel: 'View installation guide',
                  onAction: openInstallGuide,
                },
              ]
            : undefined
        }
        fullWidth
      >
        <BlockStack gap="400">
          {loading ? (
            <Card>
              <SkeletonBodyText lines={8} />
            </Card>
          ) : (
            <OneTickCheckboxForm
              form={form}
              fallbackTitle={baselineForm.title}
              setup={setup}
              styling={styling}
              themeConfig={themeConfig}
              isLoadingThemeConfig={loading}
              validationErrors={validationErrors}
              onChange={updateForm}
              onSearchResources={searchResources}
              onRefreshThemeConfig={refreshThemeConfig}
              onOpenThemeHelperUnavailable={notifyThemeHelperUnavailable}
              onOpenStyling={() => host.ports.navigation.navigate(`${host.routeBase}/styling`)}
            />
          )}
        </BlockStack>
      </Page>
      <InstallCheckboxModal
        open={installGuideOpen}
        typePlacement={form.typePlacement}
        checkboxBlockLinkProduct={themeConfig.checkboxBlockLinkProduct}
        checkboxBlockLinkCart={themeConfig.checkboxBlockLinkCart}
        onClose={closeInstallGuide}
        onContactSupport={contactSupport}
        onCodeCopied={() => host.ports.notifications.show('OneTick installation code copied.', 'success')}
      />
    </>
  )
}
