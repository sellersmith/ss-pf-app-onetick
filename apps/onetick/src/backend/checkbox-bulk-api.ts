// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendRegisterContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckbox } from '../domain/checkbox'
import { createOneTickCheckboxRepository } from './checkbox-repository'
import { publishCheckbox } from './checkbox-publisher'

export type OneTickBulkAction = 'delete' | 'duplicate' | 'activate' | 'deactivate'

export interface OneTickBulkRequest {
  action?: OneTickBulkAction
  ids?: string[]
}

export interface OneTickBulkResponse {
  success: boolean
  action?: OneTickBulkAction
  modifiedCount: number
  items: OneTickCheckbox[]
  message?: string
}

function bodyToRequest(body: unknown): OneTickBulkRequest {
  return body && typeof body === 'object' ? (body as OneTickBulkRequest) : {}
}

function validAction(action?: string): action is OneTickBulkAction {
  return ['delete', 'duplicate', 'activate', 'deactivate'].includes(String(action))
}

export function registerOneTickCheckboxBulkApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'POST',
    path: '/checkboxes/bulk',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const bulk = bodyToRequest(request.body)
      const ids = [...new Set((bulk.ids || []).filter(Boolean))]
      if (!validAction(bulk.action)) return { status: 400, body: { success: false, message: 'Invalid bulk action' } }
      if (!ids.length) return { status: 400, body: { success: false, message: 'No add-ons selected' } }

      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const results = await Promise.all(ids.map(async id => {
        if (bulk.action === 'delete') {
          const item = await repository.softDelete(id)
          if (item) {
            await app.ports.appMetafields.setMany(request.context, [
              {
                namespace: 'onetick_checkbox',
                key: id,
                type: 'json',
                owner: 'app-installation',
                value: { id, deleted: true },
                reason: 'onetick-checkbox-admin-bulk-delete',
              },
            ])
          }
          return item
        }

        if (bulk.action === 'duplicate') {
          const item = await repository.duplicate(id)
          if (!item) return null
          const published = await publishCheckbox(request.context, app, item, repository)
          return published.item
        }

        const current = await repository.get(id)
        const nextIsActive = bulk.action === 'activate'
        if (!current || current.isActive === nextIsActive) return null
        const item = await repository.update(id, { isActive: nextIsActive })
        if (!item) return null
        const published = await publishCheckbox(request.context, app, item, repository)
        return published.item
      }))
      const items = results.filter((item): item is OneTickCheckbox => Boolean(item))

      await app.ports.tracking.track(request.context, 'onetick_checkbox_bulk_action', {
        action: bulk.action,
        requestedCount: ids.length,
        modifiedCount: items.length,
      })

      return {
        body: {
          success: true,
          action: bulk.action,
          modifiedCount: items.length,
          items,
          message: `${items.length} add-on(s) ${bulk.action}`,
        } satisfies OneTickBulkResponse,
      }
    },
  })
}
