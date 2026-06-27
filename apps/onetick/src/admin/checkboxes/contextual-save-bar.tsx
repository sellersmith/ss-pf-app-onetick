// OneTick admin UI is copy-first TailorKit parity adapted to PageFly AdminAppHost and app API ports.
import { SaveBar, useAppBridge } from '@shopify/app-bridge-react'
import React, { useEffect } from 'react'

export const ONE_TICK_CHECKBOX_SAVE_BAR_ID = 'onetick-checkbox-save-bar'

interface OneTickContextualSaveBarProps {
  isOpen: boolean
  loading?: boolean
  onSave(): void
  onDiscard(): void
}

export const OneTickContextualSaveBar: React.FC<OneTickContextualSaveBarProps> = ({
  isOpen,
  loading,
  onSave,
  onDiscard,
}) => {
  const shopifyAppBridge = useAppBridge()

  useEffect(() => {
    // SaveBar visibility is controlled imperatively by App Bridge; the rendered <SaveBar> only
    // supplies the actions for the currently open dirty state.
    if (isOpen) {
      shopifyAppBridge.saveBar.show(ONE_TICK_CHECKBOX_SAVE_BAR_ID)
    } else {
      shopifyAppBridge.saveBar.hide(ONE_TICK_CHECKBOX_SAVE_BAR_ID)
    }
  }, [isOpen, shopifyAppBridge, loading])

  return (
    <SaveBar id={ONE_TICK_CHECKBOX_SAVE_BAR_ID} discardConfirmation={'' as any}>
      <button variant="primary" onClick={onSave} loading={loading ? '' : undefined} />
      <button onClick={onDiscard} disabled={loading} />
    </SaveBar>
  )
}
