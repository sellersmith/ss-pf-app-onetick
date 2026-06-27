// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { Button, InlineStack, TextField } from '@shopify/polaris'
import { XCircleIcon } from '@shopify/polaris-icons'
import React from 'react'
import { InputColorPicker } from './input-prefix'

interface ColorPickerActivatorProps {
  id: string
  value: string
  colorValue: string
  visible: boolean
  focused: boolean
  placeholder?: string
  canClear: boolean
  onValueChange(value: string): void
  onFocus(): void
  onBlur(): void
  onOpen(): void
  setVisible(value: boolean): void
  onClear(): void
}

export const ColorPickerActivator: React.FC<ColorPickerActivatorProps> = ({
  id,
  value,
  colorValue,
  visible,
  focused,
  placeholder,
  canClear,
  onValueChange,
  onFocus,
  onBlur,
  onOpen,
  setVisible,
  onClear,
}) => (
  <div onClick={onOpen}>
    <TextField
      id={`${id}--input`}
      focused={focused}
      label="Value"
      labelHidden
      autoComplete="off"
      value={value}
      onChange={onValueChange}
      placeholder={placeholder}
      spellCheck={false}
      onFocus={onFocus}
      onBlur={onBlur}
      prefix={<InputColorPicker value={colorValue} setVisible={setVisible} visible={visible} />}
      suffix={
        canClear ? (
          <InlineStack align="center" blockAlign="center">
            <Button icon={XCircleIcon} onClick={onClear} variant="plain" />
          </InlineStack>
        ) : undefined
      }
    />
  </div>
)
