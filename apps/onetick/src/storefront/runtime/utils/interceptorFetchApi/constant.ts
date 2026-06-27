import { ETriggerProductsType } from '../../constants'

const {
  ALL_PRODUCTS,
  PRODUCT_COLLECTIONS,
  PRODUCT_TAGS,
  PRODUCT_TYPES,
  PRODUCT_VERDORS,
  SPECIFIC_PRODUCTS,
  SPECIFIC_VARIANTS,
} = ETriggerProductsType

export const conditionMapping: Record<ETriggerProductsType, string> = {
  [PRODUCT_COLLECTIONS]: 'collections',
  [PRODUCT_TAGS]: 'tags',
  [PRODUCT_VERDORS]: 'vendor',
  [PRODUCT_TYPES]: 'productType',
  [SPECIFIC_PRODUCTS]: 'id',
  [ALL_PRODUCTS]: 'all-products',
  [SPECIFIC_VARIANTS]: 'variant_id',
}

export const CART_API_URL = {
  cartChange: '/cart/change',
  cartItems: '/cart',
  cartAdd: '/cart/add',
}
