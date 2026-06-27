// OneTick backend code must access PageFly only through AppBackendPlugin ctx.ports.
import type { AppBackendRegisterContext } from '../../../../web/server/src/app-platform/contracts'
import type { OneTickOnboardingState } from '../domain/onboarding'
import { createOneTickOnboardingRepository } from './onboarding-repository'

export interface OneTickOnboardingResponse {
  success: true
  onboarding: OneTickOnboardingState
}

function toInput(body: unknown): Partial<OneTickOnboardingState> {
  return body && typeof body === 'object' ? (body as Partial<OneTickOnboardingState>) : {}
}

export function registerOneTickOnboardingApi(app: AppBackendRegisterContext) {
  app.api.route({
    method: 'GET',
    path: '/onboarding',
    capability: 'canReadOneTickOnboarding',
    async handler(request) {
      const onboarding = await createOneTickOnboardingRepository(app.ports, request.context).get()
      return { body: { success: true, onboarding } satisfies OneTickOnboardingResponse }
    },
  })

  app.api.route({
    method: 'PUT',
    path: '/onboarding',
    capability: 'canWriteOneTickOnboarding',
    async handler(request) {
      const onboarding = await createOneTickOnboardingRepository(app.ports, request.context).put(toInput(request.body))
      await app.ports.tracking.track(request.context, 'onetick_checkbox_onboarding_saved', {
        currentStep: onboarding.currentStep,
      })
      return { body: { success: true, onboarding } satisfies OneTickOnboardingResponse }
    },
  })
}
