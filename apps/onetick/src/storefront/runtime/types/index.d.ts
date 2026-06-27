import type {
  EConditionProductsTriggerSettings,
  EConditionProductToOffer,
  EPlacementType,
  EProductOffersDirection,
} from '../constants'

export interface IProduct {
  id: string
  title: string
  requiresSellingPlan: boolean
  availableForSale: boolean
  tags?: string[]
  vendor?: string
  productType?: string
  featuredImage: {
    altText: string
    url: string
    width: number
  }
  variants: {
    id: number
    availableForSale: boolean
    title: string
    price: { amount: string; currencyCode: string } | null
    compareAtPrice: { amount: string; currencyCode: string } | null
    image: {
      url: string
    }
  }[]
}

export interface IProductOfferMetafieldData {
  id: string
  h: string
  rt: 'manually' | 'auto'
  l: boolean
  max: number
  eo: boolean
  ec: boolean
  bt: string
  eq: boolean
  hc: boolean
  c: any
  isDraft?: boolean
  pl: EPlacementType

  /** @deprecated */
  dt?: 'slider' | 'block'
  /** @deprecated */
  cs: string
}

export interface ICondition {
  isDraft?: boolean
  id: string
  ct: 'products-in-cart'
  poid: string
  mcic: boolean
  tp: string[]
  tpt: EConditionProductsTriggerSettings
  op: string[]
  opt: EConditionProductToOffer
}

export interface IProductOffersStyling {
  di: EProductOffersDirection
  ipsd: number
  ipsm: number
  idn: number
  cnd: number
  cnm: number
  isd: number
  ism: number
  dt: 'slider' | 'block'
}
