// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { AdminAppHost } from '../../../../../web/core/src/app-platform/admin'
import { OneTickOnboardingScreen } from '../onboarding/onboarding-screen'
import { OneTickStylingScreen } from '../styling/styling-screen'
import { OneTickCheckboxEditorScreen } from './checkbox-editor-screen'
import { OneTickCheckboxListScreen } from './checkbox-list-screen'

interface OneTickCheckboxAdminScreenProps {
  host: AdminAppHost
}

export const OneTickCheckboxAdminScreen: React.FC<OneTickCheckboxAdminScreenProps> = ({ host }) => (
  <Routes>
    <Route index element={<OneTickCheckboxListScreen host={host} />} />
    <Route path="new" element={<OneTickCheckboxEditorScreen host={host} />} />
    <Route path="edit/:id" element={<OneTickCheckboxEditorScreen host={host} />} />
    <Route path="styling" element={<OneTickStylingScreen host={host} />} />
    <Route path="onboarding" element={<OneTickOnboardingScreen host={host} />} />
    <Route path="*" element={<Navigate to="." replace />} />
  </Routes>
)
