// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { BlockStack, Icon, Modal, Page, Text, useBreakpoints } from '@shopify/polaris'
import { PlusIcon } from '@shopify/polaris-icons'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import { createOneTickAdminApi } from './api'
import { OneTickCheckboxList } from './checkbox-list'
import { defaultListFilters, type OneTickListFilters } from './list-state'
import type { OneTickCheckbox, OneTickListAction, OneTickSetupOptions } from './types'

interface OneTickCheckboxListScreenProps {
  host: AdminAppHost
}

type OneTickConfirmAction = Exclude<OneTickListAction, 'duplicate'>

const emptyLimits: OneTickSetupOptions['limits'] = {
  currentCount: 0,
  upsellProductLimit: null,
  limitReached: false,
}

const bulkActionMessages: Record<OneTickListAction, { info: [string, string]; success: [string, string] }> = {
  duplicate: { info: ['Duplicating add-on', 'Duplicating add-on products'], success: ['Add-on duplicated', 'Add-on products duplicated'] },
  delete: { info: ['Deleting add-on', 'Deleting add-on products'], success: ['Add-on deleted', 'Add-on products deleted'] },
  activate: { info: ['Activating add-on', 'Activating add-on products'], success: ['Add-on activated', 'Add-on products activated'] },
  deactivate: { info: ['Deactivating add-on', 'Deactivating add-on products'], success: ['Add-on deactivated', 'Add-on products deactivated'] },
}

function getBulkActionMessage(action: OneTickListAction, count: number, state: 'info' | 'success'): string {
  const [single, multiple] = bulkActionMessages[action][state]
  return count > 1 ? multiple : single
}

function getConfirmCopy(action: OneTickConfirmAction, count: number) {
  const copies: Record<OneTickConfirmAction, { singularTitle: string; pluralTitle: string; body: string; primaryAction: string; destructive?: boolean }> = {
    delete: {
      singularTitle: 'Delete add-on',
      pluralTitle: `Delete ${count} add-on products`,
      body: 'Delete add-on confirmation',
      primaryAction: 'Delete',
      destructive: true,
    },
    activate: {
      singularTitle: 'Activate add-on',
      pluralTitle: `Activate ${count} add-on products`,
      body: 'Activate add-on confirmation',
      primaryAction: 'Set as active',
    },
    deactivate: {
      singularTitle: 'Deactivate add-on',
      pluralTitle: `Deactivate ${count} add-on products`,
      body: 'Deactivate add-on confirmation',
      primaryAction: 'Set as draft',
    },
  }
  const copy = copies[action]
  return {
    ...copy,
    title: count > 1 ? copy.pluralTitle : copy.singularTitle,
  }
}

export const OneTickCheckboxListScreen: React.FC<OneTickCheckboxListScreenProps> = ({ host }) => {
  const isMobileView = useBreakpoints().smDown
  const api = useMemo(() => createOneTickAdminApi(host), [host])
  const [items, setItems] = useState<OneTickCheckbox[]>([])
  const [filters, setFilters] = useState<OneTickListFilters>(defaultListFilters)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmAction, setConfirmAction] = useState<OneTickConfirmAction | null>(null)
  const [loadingAction, setLoadingAction] = useState<OneTickListAction | null>(null)
  const [selectionResetKey, setSelectionResetKey] = useState(0)
  const [limits, setLimits] = useState(emptyLimits)
  const [loading, setLoading] = useState(true)
  const confirmCopy = confirmAction ? getConfirmCopy(confirmAction, selectedIds.length) : null

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [checkboxes, setup] = await Promise.all([api.loadCheckboxes(), api.loadSetupOptions()])
      setItems(checkboxes)
      setLimits(setup.limits)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    load().catch(error => {
      host.ports.notifications.show('Cannot load OneTick add-on products.', 'critical')
      console.error('[OneTick] Cannot load list', error)
    })
  }, [host, load])

  const applyBulk = useCallback(
    async (action: OneTickListAction, ids: string[]) => {
      if (!ids.length) return
      setLoadingAction(action)
      try {
        host.ports.notifications.show(getBulkActionMessage(action, ids.length, 'info'), 'info')
        await api.bulk(action, ids)
        host.ports.notifications.show(getBulkActionMessage(action, ids.length, 'success'), 'success')
        setSelectedIds([])
        setSelectionResetKey(key => key + 1)
        await load()
      } catch (error) {
        host.ports.notifications.show(`Cannot ${action} selected add-on products.`, 'critical')
      } finally {
        setLoadingAction(null)
        setConfirmAction(null)
      }
    },
    [api, host, load]
  )

  const mutateOne = (item: OneTickCheckbox, action: OneTickListAction) => applyBulk(action, [item.id])
  const duplicateSelected = useCallback(() => applyBulk('duplicate', selectedIds), [applyBulk, selectedIds])
  const createDisabled = Boolean(limits.limitReached)
  const parentRouteBase = useMemo(() => host.routeBase.split('/').slice(0, -1).join('/') || host.routeBase, [host.routeBase])

  return (
    <Page
      title="Add-on products"
      fullWidth
      backAction={{ content: 'Sales', onAction: () => host.ports.navigation.navigate(parentRouteBase) }}
      // @ts-ignore - content accepts JSX for mobile icon
      primaryAction={createDisabled ? undefined : { content: isMobileView ? <Icon source={PlusIcon} /> : 'Add add-on products', onAction: () => host.ports.navigation.navigate(`${host.routeBase}/new`) }}
      secondaryActions={[{ content: 'Manage styling', onAction: () => host.ports.navigation.navigate(`${host.routeBase}/styling`) }]}
    >
      <BlockStack gap="400">
        {createDisabled ? (
          <Text as="p" variant="bodyMd" tone="subdued">
            Your current plan has reached the add-on product limit.
          </Text>
        ) : null}
        <OneTickCheckboxList
          items={items}
          filters={filters}
          loading={loading}
          selectedAction={loadingAction}
          selectionResetKey={selectionResetKey}
          onFiltersChange={setFilters}
          onSelectionChange={setSelectedIds}
          onCreate={() => host.ports.navigation.navigate(`${host.routeBase}/new`)}
          onEdit={item => host.ports.navigation.navigate(`${host.routeBase}/edit/${item.id}`)}
          onMutate={mutateOne}
          onDuplicateBulk={duplicateSelected}
          onBulk={setConfirmAction}
        />
      </BlockStack>
      <Modal
        open={Boolean(confirmCopy)}
        onClose={() => setConfirmAction(null)}
        title={confirmCopy?.title || ''}
        primaryAction={{ content: confirmCopy?.primaryAction || 'Confirm', destructive: Boolean(confirmCopy?.destructive), onAction: () => confirmAction && applyBulk(confirmAction, selectedIds) }}
        secondaryActions={[{ content: 'Cancel', onAction: () => setConfirmAction(null) }]}
      >
        <Modal.Section>
          <Text as="p">{confirmCopy?.body}</Text>
        </Modal.Section>
      </Modal>
    </Page>
  )
}
