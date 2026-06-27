// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import {
  BlockStack,
  Box,
  Button,
  ColorPicker,
  Divider,
  InlineGrid,
  InlineStack,
  RangeSlider,
  Text,
  TextField,
  type HSBAColor,
} from '@shopify/polaris'
import { EyeDropperButton } from './eye-dropper-button'
import { PresetColors } from './preset-colors'
import type { ColorDisplayValues, ColorLocalState } from './types'

interface ColorPickerContentProps {
  id?: string
  width: string
  displayValues: ColorDisplayValues
  colorLocalState: ColorLocalState
  hasFooterSave: boolean
  onChangeColor(value: HSBAColor): void
  onChangeInput(name: string, value: string): void
  onBlur(): void
  onFocus(field: string): void
  onSelectPresetColor(hexColor: string): void
  onColorPicked(hexColor: string): void
  onClose(): void
  onSaveFooter(): void
}

export const ColorPickerContent: React.FC<ColorPickerContentProps> = ({
  id = 'onetick-color-picker',
  width,
  displayValues,
  colorLocalState,
  hasFooterSave,
  onChangeColor,
  onChangeInput,
  onBlur,
  onFocus,
  onSelectPresetColor,
  onColorPicked,
  onClose,
  onSaveFooter,
}) => (
  <Box width={width} padding="100" paddingBlockStart="200" paddingBlockEnd="200" id={`${id}--color-picker-box`}>
    <BlockStack gap="200">
      <ColorPicker id={`${id}--color-picker`} fullWidth color={colorLocalState} onChange={onChangeColor} allowAlpha />
      <EyeDropperButton
        id={`${id}--eyedropper-button`}
        onColorPicked={onColorPicked}
        accessibilityLabel="Pick color from screen"
        variant="secondary"
        fullWidth
        content="Pick color"
      />
      <InlineGrid gap="150" columns="100px repeat(3, 1fr)">
        <BlockStack>
          <Text variant="bodyMd" as="span">Hex</Text>
          <TextField
            id={`${id}--color-picker--hex`}
            label="Hex"
            labelHidden
            autoComplete="off"
            inputMode="numeric"
            value={displayValues.hex}
            onChange={value => onChangeInput('hex', value)}
            onBlur={onBlur}
            onFocus={() => onFocus('hex')}
          />
        </BlockStack>
        {['r', 'g', 'b'].map(label => (
          <BlockStack inlineAlign="center" key={label}>
            <Text variant="bodyMd" as="span">{label.toUpperCase()}</Text>
            <TextField
              id={`${id}--color-picker--${label}`}
              label={label.toUpperCase()}
              labelHidden
              autoComplete="off"
              min={0}
              max={255}
              inputMode="numeric"
              value={(displayValues as any)?.[label]?.toString()}
              onChange={value => onChangeInput(label, value)}
              onFocus={() => onFocus(label)}
              onBlur={onBlur}
            />
          </BlockStack>
        ))}
      </InlineGrid>
      <BlockStack gap="100">
        <Text variant="bodyMd" as="span">Opacity</Text>
        <InlineStack gap="200" blockAlign="center" wrap={false}>
          <Box width="100%">
            <RangeSlider
              id={`${id}--color-picker--opacity-slider`}
              label="Opacity"
              labelHidden
              min={0}
              max={100}
              value={parseInt(displayValues.a, 10) || 0}
              onChange={value => {
                onChangeInput('a', String(value))
                onFocus('a')
              }}
            />
          </Box>
          <Box maxWidth="70px">
            <TextField
              id={`${id}--color-picker--opacity`}
              label="Opacity"
              labelHidden
              autoComplete="off"
              min={0}
              max={100}
              inputMode="numeric"
              value={displayValues.a}
              onChange={value => onChangeInput('a', value)}
              onFocus={() => onFocus('a')}
              onBlur={onBlur}
              suffix="%"
            />
          </Box>
        </InlineStack>
      </BlockStack>
      <Divider />
      <PresetColors onSelect={onSelectPresetColor} />
      {hasFooterSave && (
        <>
          <Divider />
          <InlineStack wrap={false} blockAlign="center" gap="200" align="end">
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onSaveFooter} variant="primary">Save</Button>
          </InlineStack>
        </>
      )}
    </BlockStack>
  </Box>
)
