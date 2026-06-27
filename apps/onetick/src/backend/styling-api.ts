// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendRegisterContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickCheckboxGlobalStyling } from '../domain/styling'
import { createOneTickStylingRepository } from './styling-repository'
import { createOneTickStylingMetafield } from './styling-publisher'

export interface OneTickStylingResponse {
  success: true
  styling: OneTickCheckboxGlobalStyling
}

function toStyling(body: unknown): Partial<OneTickCheckboxGlobalStyling> {
  return body && typeof body === 'object' ? (body as Partial<OneTickCheckboxGlobalStyling>) : {}
}

export function registerOneTickStylingApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'GET',
    path: '/styling',
    capability: 'canReadOneTickStyling',
    async handler(request) {
      const styling = await createOneTickStylingRepository(app.ports, request.context).get()
      return { body: { success: true, styling } satisfies OneTickStylingResponse }
    },
  })

  app.api.route({
    method: 'PUT',
    path: '/styling',
    capability: 'canWriteOneTickStyling',
    async handler(request) {
      const styling = await createOneTickStylingRepository(app.ports, request.context).put(toStyling(request.body))
      await app.ports.appMetafields.setMany(request.context, [
        createOneTickStylingMetafield(styling, 'onetick-checkbox-styling-save'),
      ])
      await app.ports.tracking.track(request.context, 'onetick_checkbox_styling_saved', {})
      return { body: { success: true, styling } satisfies OneTickStylingResponse }
    },
  })
}
