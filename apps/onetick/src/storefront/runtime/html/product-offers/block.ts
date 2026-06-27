/* eslint-disable max-len */
import { EMedia, EProductOffersDirection } from '../../constants'
import type { IProduct, IProductOfferMetafieldData } from '../../types'
import { formatShopifyMoney } from '../../utils/format-currency'
import { spinner } from './spinner'

export default function renderProductOfferBlockHtmlCode(
  product: IProduct,
  currentProductOffer: IProductOfferMetafieldData,
  direction: EProductOffersDirection,
  classLayoutSelectInput: string
) {
  const { bt, eq, eo } = currentProductOffer
  const { id, featuredImage, title, availableForSale, variants } = product

  if (!availableForSale && eo) return ''

  const filteredVariants = (eo ? variants.filter(v => !!v.availableForSale) : variants).sort((a, b) =>
    b.availableForSale === a.availableForSale ? 0 : a.availableForSale ? -1 : 1
  )

  const firstVariant = filteredVariants?.[0]

  const isHorizontal = direction === EProductOffersDirection.HORIZONTAL

  return `
    <div class="onetick-offer-container-item onetick-offer-product ${
      direction === EProductOffersDirection.HORIZONTAL ? 'onetick-flex-row' : 'onetick-flex-column'
    }" data-product-id="${id}">
    ${spinner}
    <img class="onetick-offer-item-img" src="${
      firstVariant?.image?.url || (isHorizontal ? EMedia.PLACEHOLDER_IMAGE_SQUARE : EMedia.PLACEHOLDER_IMAGE_RECT)
    }" alt="${featuredImage?.altText || ''}"/>
      <div class="onetick-offer-item-info">
        <div class="onetick-offer-item-header">
          <onetick-offer-title>
            <h5 class="onetick-offer-item-title">${title}</h4>
          </onetick-offer-title>
          <div class="onetick-offer-item-price-row">
            <span class="onetick-offer-item-price">${
              !firstVariant?.price?.amount ? '' : formatShopifyMoney(firstVariant.price.amount)
            }</span>
            <span class="onetick-offer-item-compared-price">${
              !firstVariant?.compareAtPrice?.amount ? '' : formatShopifyMoney(firstVariant.compareAtPrice.amount)
            }</span>
          </div>
        </div>

        <div class="onetick-offer-item-content">
          <div class="onetick-d-flex onetick-g-8 ${classLayoutSelectInput}">
          ${
            filteredVariants.length > 1
              ? `
                  <onetick-offer-variant-selector data-featured-image='${
                    featuredImage?.url || ''
                  }' data-horizontal='${isHorizontal}'>
                    <select autocomplete="off">
                      ${filteredVariants
                        .map(
                          (variant, index) =>
                            `<option
                            value='${variant.id}'
                            name='${variant.title}'
                            data-price='${!variant.price?.amount ? '' : formatShopifyMoney(variant.price.amount)}'
                            data-compared-price='${
                              !variant.compareAtPrice?.amount ? '' : formatShopifyMoney(variant.compareAtPrice.amount)
                            }'
                            data-available-for-sale='${!!variant.availableForSale}'
                            ${index === 0 ? 'selected' : ''}
                            data-variant-img='${variant.image?.url || ''}'
                            >
                            ${variant.title}
                          </option>`
                        )
                        .join('')}
                    </select>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4.78975 6.85225C5.00942 6.63258 5.36558 6.63258 5.58525 6.85225L8.1875 9.4545L10.7898 6.85225C11.0094 6.63258 11.3656 6.63258 11.5852 6.85225C11.8049 7.07192 11.8049 7.42808 11.5852 7.64775L8.58525 10.6477C8.36558 10.8674 8.00942 10.8674 7.78975 10.6477L4.78975 7.64775C4.57008 7.42808 4.57008 7.07192 4.78975 6.85225Z"
                          fill="#616161"
                        />
                      </svg>
                  </onetick-offer-variant-selector>
                  `
              : ''
          }
          ${
            eq
              ? `<div class="numberstyle-qty">
            <button class="qty-btn qty-rem">
              -
            </button>
            <input type="number" step="1" class="onetick-quantity-selector" min="1" value="1"/>
            <button class="qty-btn qty-add">
              +
            </button>
          </div>`
              : ''
          }
          </div>

          <div
            class="onetick-upsell-button"
            data-variant-id=${firstVariant.id}
            style='display: ${firstVariant.availableForSale ? 'block' : 'none'}'
          >
              ${bt}
          </div>

          <div
            class="onetick-upsell-button disable"
            data-variant-id=${firstVariant.id}
            style='display: ${firstVariant.availableForSale ? 'none' : 'block'}'
          >
            Sold out
          </div>
        </div>
      </div>
    </div>
  `
}

export const getDefaultProductOfferGridHTML = (styleWrapperProductOffer: string) => {
  return `
  <onetick-product-offers style="${styleWrapperProductOffer}">
    <h2 class="onetick-product-offers-title" style="font-weight: 650;"></h2>
    <div class="onetick-offer-container">
      <div class="onetick-loading-overlay"></div>
      <div class="onetick-grid-items"></div>
    </div>
  </onetick-product-offers>
`
}

export const loadingSkeletonGrid = (itemsPerShow: number, direction: EProductOffersDirection) => {
  return `
  <div class="onetick-grid-items-loading">
    ${Array.from({ length: itemsPerShow })
      .map(
        () => `<div class="onetick-item-loading onetick-flex-${
          direction === 'horizontal' ? 'row' : 'column'
        }" style="min-width: calc(100%/${itemsPerShow});">
                <div class="onetick-img-skeleton"></div>
                <div class="onetick-d-flex onetick-flex-col onetick-lines-skeleton">
                  <div class="onetick-line-skeleton"></div>
                  <div class="onetick-line-skeleton"></div>
                  <div class="onetick-line-skeleton"></div>
                </div>
              </div>
              `
      )
      .join(' ')}
  </div>`
}
