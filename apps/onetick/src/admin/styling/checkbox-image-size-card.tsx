// OneTick styling UI is app-local TailorKit parity; persistence stays behind app API ports.
import { BlockStack, Box, Card, InlineStack, RangeSlider, Text, TextField } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import type { OneTickCheckboxGlobalStyling } from '../checkboxes/types'

interface CheckboxImageSizeCardProps {
  styling: OneTickCheckboxGlobalStyling
  onChange(updates: Partial<OneTickCheckboxGlobalStyling>): void
}

const MIN_SIZE = 40
const MAX_SIZE = 120

export const CheckboxImageSizeCard: React.FC<CheckboxImageSizeCardProps> = ({ styling, onChange }) => {
  const [inputValue, setInputValue] = useState(String(styling.imageSize || MIN_SIZE))

  useEffect(() => {
    setInputValue(String(styling.imageSize || MIN_SIZE))
  }, [styling.imageSize])

  const handleSliderChange = useCallback(
    (value: number) => {
      setInputValue(String(value))
      onChange({ imageSize: value })
    },
    [onChange]
  )

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
  }, [])

  const handleInputBlur = useCallback(() => {
    let numValue = parseInt(inputValue, 10)

    if (isNaN(numValue)) {
      numValue = MIN_SIZE
    } else if (numValue < MIN_SIZE) {
      numValue = MIN_SIZE
    } else if (numValue > MAX_SIZE) {
      numValue = MAX_SIZE
    }

    setInputValue(String(numValue))
    onChange({ imageSize: numValue })
  }, [inputValue, onChange])

  return (
    <Card roundedAbove="sm">
      <BlockStack gap="200">
        <Text variant="headingSm" as="span">Image size</Text>
        <InlineStack gap="400" wrap={false} blockAlign="center">
          <Box width="100%">
            <RangeSlider
              label="Image size"
              labelHidden
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={styling.imageSize || MIN_SIZE}
              onChange={handleSliderChange}
              output
            />
          </Box>
          <Box minWidth="80px">
            <TextField
              label="Size"
              labelHidden
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              suffix="px"
              autoComplete="off"
            />
          </Box>
        </InlineStack>
      </BlockStack>
    </Card>
  )
}
