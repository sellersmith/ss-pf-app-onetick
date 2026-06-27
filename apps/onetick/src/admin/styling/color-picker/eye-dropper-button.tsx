// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { Button } from '@shopify/polaris'
import { EyeDropperIcon } from '@shopify/polaris-icons'
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import tinycolor from 'tinycolor2'

function isEyeDropperSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'EyeDropper' in window
}

interface EyeDropperButtonProps {
  onColorPicked(hexColor: string): void
  id?: string
  accessibilityLabel?: string
  variant?: 'primary' | 'secondary' | 'plain' | 'tertiary'
  fullWidth?: boolean
  content?: string
}

export const EyeDropperButton: React.FC<EyeDropperButtonProps> = ({
  onColorPicked,
  id,
  accessibilityLabel = 'Pick color from screen',
  variant = 'secondary',
  fullWidth = false,
  content,
}) => {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(isEyeDropperSupported())
  }, [])

  const handleClick = useCallback(async () => {
    if (!isSupported) return

    try {
      const eyeDropper = new (window as any).EyeDropper()
      const result = await eyeDropper.open()

      if (result?.sRGBHex && tinycolor(result.sRGBHex).isValid()) {
        startTransition(() => {
          onColorPicked(result.sRGBHex)
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('EyeDropper error:', error)
      }
    }
  }, [isSupported, onColorPicked])

  if (!isSupported) return null

  return (
    <Button
      id={id}
      icon={EyeDropperIcon}
      onClick={handleClick}
      accessibilityLabel={accessibilityLabel}
      variant={variant}
      fullWidth={fullWidth}
    >
      {content}
    </Button>
  )
}
