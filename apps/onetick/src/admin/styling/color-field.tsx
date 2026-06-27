// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import React from 'react'
import { EditorColorPicker } from './color-picker/editor-color-picker'

interface ColorFieldProps {
  label: string
  value: string
  onChange(value: string): void
}

export const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange }) => (
  <EditorColorPicker id={`onetick-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} value={value} onChange={onChange} debounceMs={100} />
)
