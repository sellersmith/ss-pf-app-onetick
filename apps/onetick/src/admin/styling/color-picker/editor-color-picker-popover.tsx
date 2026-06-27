// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { Popover, type HSBAColor } from '@shopify/polaris'
import React from 'react'
import { ColorPickerContent } from './color-picker-content'
import type { ColorDisplayValues, ColorLocalState } from './types'

interface EditorColorPickerPopoverProps {
  id: string
  width: string
  active: boolean
  activator: React.ReactElement
  displayValues: ColorDisplayValues
  colorLocalState: ColorLocalState
  hasFooterSave: boolean
  onClose(): void
  onChangeColor(value: HSBAColor): void
  onChangeInput(name: string, value: string): void
  onBlur(): void
  onFocus(field: string): void
  onSelectPresetColor(hexColor: string): void
  onColorPicked(hexColor: string): void
  onSaveFooter(): void
}

export const EditorColorPickerPopover: React.FC<EditorColorPickerPopoverProps> = ({
  id,
  width,
  active,
  activator,
  displayValues,
  colorLocalState,
  hasFooterSave,
  onClose,
  onChangeColor,
  onChangeInput,
  onBlur,
  onFocus,
  onSelectPresetColor,
  onColorPicked,
  onSaveFooter,
}) => (
  <Popover
    active={active}
    activator={activator}
    onClose={onClose}
    preventFocusOnClose
    ariaHaspopup="dialog"
    sectioned
    preferredPosition="below"
    preferInputActivator
    preferredAlignment="center"
    fluidContent
    preventCloseOnChildOverlayClick
    zIndexOverride={1000}
  >
    <ColorPickerContent
      id={id}
      width={width}
      displayValues={displayValues}
      colorLocalState={colorLocalState}
      hasFooterSave={hasFooterSave}
      onChangeColor={onChangeColor}
      onChangeInput={onChangeInput}
      onBlur={onBlur}
      onFocus={onFocus}
      onSelectPresetColor={onSelectPresetColor}
      onColorPicked={onColorPicked}
      onClose={onClose}
      onSaveFooter={onSaveFooter}
    />
  </Popover>
)
