// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import { BlockStack, Grid, Page } from '@shopify/polaris'
import React, { useEffect, useMemo, useState } from 'react'
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import { defaultCheckboxStyling, mergeCheckboxStyling } from '../../domain/styling'
import { createOneTickAdminApi } from '../checkboxes/api'
import { OneTickContextualSaveBar } from '../checkboxes/contextual-save-bar'
import type { OneTickCheckboxGlobalStyling } from '../checkboxes/types'
import { CheckboxColorCard } from './checkbox-color-card'
import { CheckboxImageSizeCard } from './checkbox-image-size-card'
import { CheckboxTypeCard } from './checkbox-type-card'
import { StylingPreview } from './styling-preview'

interface OneTickStylingScreenProps {
  host: AdminAppHost
}

export const OneTickStylingScreen: React.FC<OneTickStylingScreenProps> = ({ host }) => {
  const api = useMemo(() => createOneTickAdminApi(host), [host])
  const [styling, setStyling] = useState<OneTickCheckboxGlobalStyling>(defaultCheckboxStyling)
  const [baselineStyling, setBaselineStyling] = useState<OneTickCheckboxGlobalStyling>(defaultCheckboxStyling)
  const [saving, setSaving] = useState(false)
  const isDirty = useMemo(() => JSON.stringify(styling) !== JSON.stringify(baselineStyling), [baselineStyling, styling])

  useEffect(() => {
    api.loadStyling()
      .then(response => {
        setStyling(response.styling)
        setBaselineStyling(response.styling)
      })
      .catch(error => {
        host.ports.notifications.show('Cannot load OneTick styling.', 'critical')
        console.error('[OneTick] Cannot load styling', error)
      })
  }, [api, host])

  const update = (updates: Partial<OneTickCheckboxGlobalStyling>) => setStyling(current => mergeCheckboxStyling({ ...current, ...updates }))
  const save = async () => {
    setSaving(true)
    try {
      const response = await api.saveStyling(styling)
      setStyling(response.styling)
      setBaselineStyling(response.styling)
      host.ports.notifications.show('OneTick styling saved.', 'success')
    } catch (error) {
      host.ports.notifications.show('Cannot save OneTick styling.', 'critical')
    } finally {
      setSaving(false)
    }
  }
  const discard = () => setStyling(baselineStyling)

  return (
    <>
      <OneTickContextualSaveBar isOpen={isDirty} loading={saving} onSave={save} onDiscard={discard} />
      <Page title="Styling" backAction={{ content: 'Add-on products', onAction: () => host.ports.navigation.navigate(host.routeBase) }} fullWidth>
        <Grid gap={{ xs: '400' }}>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 8, xl: 8 }}>
            <BlockStack gap="400">
              <CheckboxTypeCard styling={styling} onChange={update} />
              <CheckboxColorCard styling={styling} onChange={update} />
              <CheckboxImageSizeCard styling={styling} onChange={update} />
            </BlockStack>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 4 }}>
            <div className="ot-sticky-preview-card">
              <StylingPreview styling={styling} />
            </div>
          </Grid.Cell>
        </Grid>
      </Page>
    </>
  )
}
