// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import type { HSBColor } from '@shopify/polaris'

export interface ColorDisplayValues {
  r: number
  g: number
  b: number
  a: string
  hex: string
}

export interface EditorColorPickerProps {
  id?: string
  value?: string
  placeholder?: string
  width?: string
  debounceMs?: number
  hasFooterSave?: boolean
  defaultVisible?: boolean
  onChange?(color: string, notPushHistory?: boolean): void
  onClosePopup?(): void
  onClear?(): void
}

export type ColorLocalState = HSBColor
