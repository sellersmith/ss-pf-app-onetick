// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendRegisterContext, AppContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckbox, OneTickCheckboxInput } from '../domain/checkbox'
import { createOneTickCheckboxRepository } from './checkbox-repository'
import { publishCheckbox } from './checkbox-publisher'

export interface OneTickCheckboxListResponse {
  success: true
  items: OneTickCheckbox[]
}

export interface OneTickCheckboxMutationResponse {
  success: boolean
  item?: OneTickCheckbox
  message?: string
}

function pathId(ctx: AppContext, path?: string): string {
  const id = String(path || '').split('/')[1]
  if (!id) throw new Error(`Missing OneTick checkbox id for ${ctx.appId}`)
  return id
}

function toInput(body: unknown): OneTickCheckboxInput {
  return body && typeof body === 'object' ? (body as OneTickCheckboxInput) : {}
}

function notFound(id: string): OneTickCheckboxMutationResponse {
  return { success: false, message: `OneTick checkbox not found: ${id}` }
}

export function registerOneTickCheckboxApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'GET',
    path: '/checkboxes',
    capability: 'canReadOneTickCheckboxes',
    async handler(request) {
      const items = await createOneTickCheckboxRepository(app.ports, request.context).list()
      return { body: { success: true, items } satisfies OneTickCheckboxListResponse }
    },
  })

  app.api.route({
    method: 'GET',
    path: '/checkboxes/:id',
    capability: 'canReadOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const item = await createOneTickCheckboxRepository(app.ports, request.context).get(id)
      return item ? { body: { success: true, item } } : { status: 404, body: notFound(id) }
    },
  })

  app.api.route({
    method: 'POST',
    path: '/checkboxes',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const item = await repository.create(toInput(request.body))
      const published = await publishCheckbox(request.context, app, item, repository)
      return {
        status: 201,
        body: { success: true, item: published.item, message: published.message } satisfies OneTickCheckboxMutationResponse,
      }
    },
  })

  app.api.route({
    method: 'PUT',
    path: '/checkboxes/:id',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const item = await repository.update(id, toInput(request.body))
      if (!item) return { status: 404, body: notFound(id) }
      const published = await publishCheckbox(request.context, app, item, repository)
      return { body: { success: true, item: published.item, message: published.message } satisfies OneTickCheckboxMutationResponse }
    },
  })

  app.api.route({
    method: 'POST',
    path: '/checkboxes/:id/activate',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const item = await repository.update(id, { isActive: true })
      if (!item) return { status: 404, body: notFound(id) }
      const published = await publishCheckbox(request.context, app, item, repository)
      return { body: { success: true, item: published.item, message: published.message } satisfies OneTickCheckboxMutationResponse }
    },
  })

  app.api.route({
    method: 'POST',
    path: '/checkboxes/:id/deactivate',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const item = await repository.update(id, { isActive: false })
      if (!item) return { status: 404, body: notFound(id) }
      const published = await publishCheckbox(request.context, app, item, repository)
      return { body: { success: true, item: published.item, message: published.message } satisfies OneTickCheckboxMutationResponse }
    },
  })

  app.api.route({
    method: 'POST',
    path: '/checkboxes/:id/duplicate',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const repository = createOneTickCheckboxRepository(app.ports, request.context)
      const item = await repository.duplicate(id)
      if (!item) return { status: 404, body: notFound(id) }
      const published = await publishCheckbox(request.context, app, item, repository)
      return {
        status: 201,
        body: { success: true, item: published.item, message: published.message } satisfies OneTickCheckboxMutationResponse,
      }
    },
  })

  app.api.route({
    method: 'DELETE',
    path: '/checkboxes/:id',
    capability: 'canWriteOneTickCheckboxes',
    async handler(request) {
      const id = pathId(request.context, String(request.params.path || ''))
      const item = await createOneTickCheckboxRepository(app.ports, request.context).softDelete(id)
      if (!item) return { status: 404, body: notFound(id) }
      await app.ports.appMetafields.setMany(request.context, [
        {
          namespace: 'onetick_checkbox',
          key: id,
          type: 'json',
          owner: 'app-installation',
          value: { id, deleted: true },
          reason: 'onetick-checkbox-admin-delete',
        },
      ])
      return { body: { success: true, item } satisfies OneTickCheckboxMutationResponse }
    },
  })

}
