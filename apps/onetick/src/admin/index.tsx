// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import React from 'react'
import type { AdminAppHost } from '../../../../web/core/src/app-platform/admin'
import { OneTickCheckboxAdminScreen } from './checkboxes/admin-screen'
import './admin.css'

interface OneTickAdminProps {
  host: AdminAppHost
}

export const OneTickAdmin: React.FC<OneTickAdminProps> = ({ host }) => <OneTickCheckboxAdminScreen host={host} />

export default OneTickAdmin
