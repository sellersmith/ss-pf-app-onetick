// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import type {
  OneTickBulkResponse,
  OneTickCheckbox,
  OneTickCheckboxDetailResponse,
  OneTickCheckboxInput,
  OneTickCheckboxListResponse,
  OneTickCheckboxMutationResponse,
  OneTickListAction,
  OneTickOnboardingResponse,
  OneTickSetupOptionsResponse,
  OneTickThemeConfigResponse,
  OneTickStylingResponse,
} from './types'

export function createOneTickAdminApi(host: AdminAppHost) {
  return {
    async loadCheckboxes(): Promise<OneTickCheckbox[]> {
      return (await host.api.get<OneTickCheckboxListResponse>('/checkboxes')).items
    },
    async loadCheckbox(id: string): Promise<OneTickCheckbox | null> {
      const response = await host.api.get<OneTickCheckboxDetailResponse>(`/checkboxes/${id}`)
      return response.success ? response.item || null : null
    },
    async loadSetupOptions(query?: string): Promise<OneTickSetupOptionsResponse> {
      const keyword = query?.trim()
      return host.api.get<OneTickSetupOptionsResponse>(
        keyword ? `/setup-options?q=${encodeURIComponent(keyword)}` : '/setup-options',
      )
    },
    async createCheckbox(input: OneTickCheckboxInput): Promise<OneTickCheckboxMutationResponse> {
      return host.api.post<OneTickCheckboxMutationResponse>('/checkboxes', input)
    },
    async updateCheckbox(id: string, input: OneTickCheckboxInput): Promise<OneTickCheckboxMutationResponse> {
      return host.api.put<OneTickCheckboxMutationResponse>(`/checkboxes/${id}`, input)
    },
    async mutateCheckbox(id: string, action: OneTickListAction): Promise<OneTickCheckboxMutationResponse> {
      if (action === 'delete') return host.api.delete<OneTickCheckboxMutationResponse>(`/checkboxes/${id}`)
      return host.api.post<OneTickCheckboxMutationResponse>(`/checkboxes/${id}/${action}`)
    },
    async bulk(action: OneTickListAction, ids: string[]): Promise<OneTickBulkResponse> {
      return host.api.post<OneTickBulkResponse>('/checkboxes/bulk', { action, ids })
    },
    async loadStyling(): Promise<OneTickStylingResponse> {
      return host.api.get<OneTickStylingResponse>('/styling')
    },
    async loadThemeConfig(): Promise<OneTickThemeConfigResponse> {
      return host.api.get<OneTickThemeConfigResponse>('/theme-config')
    },
    async saveStyling(styling: OneTickStylingResponse['styling']): Promise<OneTickStylingResponse> {
      return host.api.put<OneTickStylingResponse>('/styling', styling)
    },
    async loadOnboarding(): Promise<OneTickOnboardingResponse> {
      return host.api.get<OneTickOnboardingResponse>('/onboarding')
    },
    async saveOnboarding(onboarding: Partial<OneTickOnboardingResponse['onboarding']>): Promise<OneTickOnboardingResponse> {
      return host.api.put<OneTickOnboardingResponse>('/onboarding', onboarding)
    },
  }
}
