// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { hsbToRgb, rgbToHsb, rgbaString, type HSBAColor } from '@shopify/polaris'
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import tinycolor from 'tinycolor2'
import { ColorPickerActivator } from './color-picker-activator'
import { convertTinycolorToPolarisColor, getColors, tinycolorFromDisplayValues, toDisplayValues } from './color-utils'
import { EditorColorPickerPopover } from './editor-color-picker-popover'
import type { ColorDisplayValues, EditorColorPickerProps } from './types'
import { useDebouncedCallback } from './use-debounced-callback'

const transparent = 'rgba(0,0,0,0)'

export const EditorColorPicker: React.FC<EditorColorPickerProps> = ({
  value,
  placeholder,
  onChange,
  onClear,
  hasFooterSave = false,
  defaultVisible = null,
  onClosePopup,
  id = 'onetick-color-picker',
  width = '300px',
  debounceMs,
}) => {
  const colorValue = value || placeholder || transparent
  const color = tinycolor(colorValue)
  const { rgbColor, hexColor, hsbColor } = getColors(color)
  const [visible, setVisible] = useState(false)
  const [focusInput, setFocusInput] = useState(false)
  const [focus, setFocus] = useState('')
  const [colorInputValue, setColorInputValue] = useState(colorValue)
  const [displayValues, setDisplayValues] = useState<ColorDisplayValues>(toDisplayValues(color))
  const [colorLocalState, setColorLocalState] = useState(hsbColor)

  const debouncedOnChange = useDebouncedCallback((nextColor: string) => onChange?.(nextColor), debounceMs)
  const emitLiveChange = useCallback(
    (nextColor: string) => {
      if (debounceMs && debounceMs > 0) {
        debouncedOnChange(nextColor)
        return
      }
      onChange?.(nextColor)
    },
    [debounceMs, debouncedOnChange, onChange]
  )

  useEffect(() => {
    if (focus) return
    setColorInputValue(colorValue)
    setColorLocalState(hsbColor)
    setDisplayValues(toDisplayValues(color))
  }, [colorValue, focus, hsbColor])

  const onChangeColorHasFooterSave = useCallback(
    (nextColor: HSBAColor, push: boolean) => {
      const c = tinycolor(rgbaString(hsbToRgb(nextColor)))
      setDisplayValues(toDisplayValues(c))
      if (push) onChange?.(c.toRgbString())
    },
    [onChange]
  )

  const handleChangeLocalState = useCallback(
    (nextColor: HSBAColor) => {
      setColorLocalState(nextColor)
      if (hasFooterSave) {
        onChangeColorHasFooterSave(nextColor, false)
        return
      }
      const c = tinycolor(rgbaString(hsbToRgb(nextColor)))
      const rgbString = c.toRgbString()
      emitLiveChange(rgbString)
      setColorInputValue(rgbString)
      setDisplayValues(toDisplayValues(c))
    },
    [emitLiveChange, hasFooterSave, onChangeColorHasFooterSave]
  )

  const onChangeInput = useCallback((name: string, nextValue: string) => {
    setDisplayValues(previous => ({ ...previous, [name]: nextValue }))
  }, [])

  useEffect(() => {
    const nextColor = tinycolorFromDisplayValues(focus, displayValues)
    const rgbString = nextColor.toRgbString()
    if (nextColor.isValid() && focus && hasFooterSave) {
      setColorLocalState(rgbToHsb(convertTinycolorToPolarisColor(nextColor.toRgb())))
    } else if (nextColor.isValid() && focus && value !== rgbString) {
      setColorInputValue(rgbString)
      setColorLocalState(rgbToHsb(convertTinycolorToPolarisColor(nextColor.toRgb())))
      emitLiveChange(rgbString)
    }
  }, [displayValues, emitLiveChange, focus, hasFooterSave, value])

  const onBlur = useCallback(() => {
    const rgbString = color.toRgbString()
    setFocusInput(false)
    setFocus('')

    if (hasFooterSave) {
      const nextColor = tinycolorFromDisplayValues(focus, displayValues)
      setDisplayValues(previous => ({ ...toDisplayValues(nextColor), hex: previous.hex }))
      return
    }

    if (color.isValid() && value !== rgbString) {
      setColorInputValue(rgbString)
      onChange?.(rgbString)
    }

    setDisplayValues({ r: rgbColor.r, g: rgbColor.g, b: rgbColor.b, a: Math.round(rgbColor.a * 100).toFixed(0), hex: hexColor })
  }, [color, displayValues, focus, hasFooterSave, hexColor, onChange, rgbColor, value])

  const onSelectPresetColor = useCallback(
    (hex: string) => {
      const c = tinycolor(hex)
      const rgbString = c.toRgbString()
      if (!hasFooterSave) emitLiveChange(rgbString)
      setColorLocalState(rgbToHsb(convertTinycolorToPolarisColor(c.toRgb())))
      setColorInputValue(rgbString)
      setDisplayValues(toDisplayValues(c))
    },
    [emitLiveChange, hasFooterSave]
  )

  const handleColorPicked = useCallback(
    (hex: string) => {
      const c = tinycolor(hex)
      const rgbString = c.toRgbString()
      startTransition(() => {
        setColorLocalState(rgbToHsb(convertTinycolorToPolarisColor(c.toRgb())))
        setColorInputValue(rgbString)
        setDisplayValues(toDisplayValues(c))
      })
      if (!hasFooterSave) emitLiveChange(rgbString)
    },
    [emitLiveChange, hasFooterSave]
  )

  const handleClear = useCallback(() => {
    onClear?.()
    setColorInputValue('')
  }, [onClear])

  const handleSaveFooter = useCallback(() => {
    onChangeColorHasFooterSave(colorLocalState as HSBAColor, true)
    setVisible(false)
    onClosePopup?.()
  }, [colorLocalState, onChangeColorHasFooterSave, onClosePopup])

  const handleActivatorValueChange = useCallback(
    (nextValue: string) => {
      setColorInputValue(nextValue)
      if (tinycolor(nextValue).isValid()) emitLiveChange(nextValue)
    },
    [emitLiveChange]
  )

  const activator = (
    <ColorPickerActivator
      id={id}
      value={colorInputValue}
      colorValue={colorValue}
      visible={visible}
      focused={focusInput}
      placeholder={placeholder}
      canClear={Boolean(onClear && colorInputValue)}
      onValueChange={handleActivatorValueChange}
      onFocus={() => setFocusInput(true)}
      onBlur={onBlur}
      onOpen={() => setVisible(true)}
      setVisible={setVisible}
      onClear={handleClear}
    />
  )

  return (
    <EditorColorPickerPopover
      id={id}
      width={width}
      active={typeof defaultVisible === 'boolean' ? defaultVisible : visible}
      activator={activator}
      onClose={() => {
        setVisible(false)
        onClosePopup?.()
      }}
      displayValues={displayValues}
      colorLocalState={colorLocalState}
      hasFooterSave={hasFooterSave}
      onChangeColor={handleChangeLocalState}
      onChangeInput={onChangeInput}
      onBlur={onBlur}
      onFocus={setFocus}
      onSelectPresetColor={onSelectPresetColor}
      onColorPicked={handleColorPicked}
      onSaveFooter={handleSaveFooter}
    />
  )
}
