/* eslint-disable react/no-danger */
import { Box, Button, InlineStack, TextField } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import type { OneTickCheckboxGlobalStyling } from './types'
import { PopupPreview } from './preview-popup'
import { VariantSelectorPreview, type OneTickPreviewVariant } from './preview-variant-selector'

export const PLACEHOLDER_IMAGE = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'onetick-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface PreviewLayoutProps {
  heading: string
  description: string
  showHeading: boolean
  showDescription: boolean
  showPrice: boolean
  showComparedPrice: boolean
  price: string
  compareAtPrice?: string
  showFeaturedImage: boolean
  showVariantSelector: boolean
  showQuantitySelector: boolean
  showPersonalizeButton: boolean
  showPopup: boolean
  preCheck: boolean
  imageUrl: string
  previewVariant: OneTickPreviewVariant | null
  setPreviewVariant: React.Dispatch<React.SetStateAction<OneTickPreviewVariant | null>>
  variants: OneTickPreviewVariant[]
  hasMultipleVariants: boolean
  variantTitle: string
  styling: OneTickCheckboxGlobalStyling
}

export const PreviewLayout: React.FC<PreviewLayoutProps> = props => {
  const [checked, setChecked] = useState(props.preCheck)
  const [quantity, setQuantity] = useState(1)
  const { styling } = props
  const containerPadding = styling.checkboxItem.defaultBackground !== '#FFFFFF00' || styling.checkboxItem.defaultBorder !== '#FFFFFF00' ? '16px' : '0px'
  const stop = useCallback((event: React.SyntheticEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])
  const handleToggle = useCallback(() => {
    setChecked(previous => !previous)
  }, [])
  useEffect(() => {
    setChecked(props.preCheck)
  }, [props.preCheck])

  return (
    <onetick-checkbox
      className="onetick-checkbox-container"
      style={{ '--o-cdbg': styling.checkboxItem.defaultBackground, '--o-cdb': styling.checkboxItem.defaultBorder, '--o-padding': containerPadding } as React.CSSProperties}
    >
      <div className="onetick-d-flex onetick-g-10" style={{ cursor: 'default' }}>
        <div className="onetick-d-flex onetick-g-10 onetick-img-checkbox">
          <label
            className="onetick-checkbox"
            style={{ '--o-ti': styling.tickIcon, '--o-dbg': styling.defaultBackground, '--o-abg': styling.activeBackground, '--o-db': styling.defaultBorder, '--o-ab': styling.activeBorder, '--o-ct': styling.checkboxType } as React.CSSProperties}
          >
            <input
              type="checkbox"
              checked={checked}
              onInput={event => {
                event.stopPropagation()
                handleToggle()
              }}
              readOnly
            />
            <span className="onetick-checkmark" />
          </label>
          {props.showFeaturedImage ? (
            <img
              className="onetick-image-checkbox"
              src={props.imageUrl}
              onError={event => ((event.target as HTMLImageElement).src = PLACEHOLDER_IMAGE)}
              loading="lazy"
              style={{ width: `${styling.imageSize}px`, height: `${styling.imageSize}px` }}
              alt="Checkbox upsell"
            />
          ) : null}
        </div>
        <div className="onetick-d-flex onetick-flex-1 onetick-g-10">
          <div className="onetick-checkbox-content onetick-flex-1">
            <div className="onetick-d-flex onetick-wrap onetick-g-8 onetick-r-g-10 onetick-flex-col">
              <div className="onetick-d-flex onetick-g-4 onetick-flex-col">
                {props.showHeading && props.heading ? (
                  <h2
                    className="onetick-label"
                    style={{ fontWeight: 650, cursor: 'pointer' }}
                    onClick={handleToggle}
                    dangerouslySetInnerHTML={{ __html: props.heading }}
                  />
                ) : null}
                {props.showDescription && props.description ? (
                  <span
                    className="onetick-description"
                    style={{ pointerEvents: 'none' }}
                    dangerouslySetInnerHTML={{ __html: props.description }}
                  />
                ) : null}
              </div>
              {(props.showPrice || props.showComparedPrice) ? (
                <div className="onetick-g-8 onetick-d-flex onetick-wrap">
                  {props.showPrice ? (
                    <h2 className="onetick-price" style={{ fontWeight: 550, pointerEvents: 'none' }}>{props.price}</h2>
                  ) : null}
                  {props.showComparedPrice && props.compareAtPrice ? (
                    <h2 className="onetick-compared-price" style={{ fontWeight: 450, pointerEvents: 'none' }}>
                      {props.compareAtPrice}
                    </h2>
                  ) : null}
                </div>
              ) : null}
            </div>
            <VariantSelectorPreview
              showVariantSelector={props.showVariantSelector}
              hasMultipleVariants={props.hasMultipleVariants}
              variants={props.variants}
              previewVariant={props.previewVariant}
              setPreviewVariant={props.setPreviewVariant}
              variantTitle={props.variantTitle}
            />
            {props.showPersonalizeButton ? (
              <button type="button" className="onetick-personalize-btn" onClick={stop}>{styling.personalizeButton.buttonText}</button>
            ) : null}
            {props.showQuantitySelector ? (
              <Box paddingBlockStart="200" maxWidth="220px">
                <div onClick={stop} onMouseDown={stop}>
                  <InlineStack gap="100" blockAlign="center" wrap={false}>
                    <Button
                      size="slim"
                      onClick={() => setQuantity(previous => Math.max(1, previous - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <TextField
                      label="Quantity"
                      labelHidden
                      type="number"
                      value={String(quantity)}
                      min={1}
                      onChange={value => {
                        const parsed = Number(value)
                        if (!Number.isNaN(parsed)) {
                          setQuantity(Math.max(1, parsed))
                        }
                      }}
                      autoComplete="off"
                    />
                    <Button size="slim" onClick={() => setQuantity(previous => previous + 1)}>+</Button>
                  </InlineStack>
                </div>
              </Box>
            ) : null}
          </div>
          <PopupPreview showPopup={props.showPopup} />
        </div>
      </div>
    </onetick-checkbox>
  )
}
