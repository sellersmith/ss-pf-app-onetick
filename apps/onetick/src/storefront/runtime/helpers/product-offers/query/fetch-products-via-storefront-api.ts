/**
 * Direct Storefront API client for fetching products by IDs.
 * Bypasses the app proxy to call Shopify Storefront GraphQL directly,
 * eliminating the extra network hop through our server.
 *
 * Uses `nodes(ids:)` query which is more efficient than `products(query:)`
 * — exact results, no pagination needed, up to 250 IDs per query.
 */
import type { IProduct } from '../../../types'

const STOREFRONT_API_VERSION = '2025-10'
const GID_PRODUCT_PREFIX = 'gid://shopify/Product/'
const GID_VARIANT_PREFIX = 'gid://shopify/ProductVariant/'
const GID_COLLECTION_PREFIX = 'gid://shopify/Collection/'

/** In-memory cache keyed by sorted IDs + country */
const cache = new Map<string, Promise<IProduct[] | null>>()
const addonVariantCache = new Map<string, Promise<AddonVariant[] | null>>()

const PRODUCTS_BY_IDS_QUERY = `
  query getProductsByIds($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        featuredImage { url altText width }
        tags
        vendor
        productType
        availableForSale
        requiresSellingPlan
        collections(first: 250) { nodes { id } }
        variants(first: 250) {
          nodes {
            id
            title
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url }
          }
        }
      }
    }
  }
`

const ADDON_VARIANTS_BY_PRODUCT_IDS_QUERY = `
  query getAddonVariantsByProductIds($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        requiresSellingPlan
        variants(first: 250) {
          nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
          }
        }
      }
    }
  }
`

export type AddonVariant = {
  id: string
  addonVariantPrice: string
  addonVariantComparedPrice: string | number
  requires_selling_plan: boolean
  first_selling_plan_allocation_id: boolean
  allowATC: boolean
  title: string
  product: {
    id: number
    handle: string
    title: string
    variantsCount: number
  }
}

/** Strip GID prefix, returning only the numeric ID */
const stripGid = (gid: string, prefix: string): string => gid.replace(prefix, '')

/** Ensure ID has the GID prefix */
const toGid = (id: unknown, prefix: string): string | null => {
  if (typeof id !== 'string' && typeof id !== 'number') return null
  const rawId = String(id).trim()
  if (!rawId) return null
  return rawId.startsWith('gid://') ? rawId : `${prefix}${rawId}`
}

function toUniqueProductGids(ids: unknown[]): string[] {
  const gids = ids
    .flatMap(id => (typeof id === 'string' ? id.split(',') : [id]))
    .map(id => toGid(id, GID_PRODUCT_PREFIX))
    .filter((id): id is string => Boolean(id))

  return Array.from(new Set(gids))
}

/**
 * Transform a Storefront API product node into the IProduct shape
 * expected by all OneTick callers (stripped numeric IDs).
 */
function transformProduct(node: any): IProduct {
  // `collections` not in IProduct but used by callers via `any` cast (sort-and-match-condition.ts)
  const product: Record<string, any> = {
    id: stripGid(node.id, GID_PRODUCT_PREFIX),
    title: node.title,
    availableForSale: node.availableForSale,
    requiresSellingPlan: node.requiresSellingPlan,
    tags: node.tags || [],
    vendor: node.vendor || '',
    productType: node.productType || '',
    featuredImage: node.featuredImage || { url: '', altText: '', width: 0 },
    collections: (node.collections?.nodes || []).map((c: { id: string }) => stripGid(c.id, GID_COLLECTION_PREFIX)),
    variants: (node.variants?.nodes || []).map((v: any) => ({
      id: Number(stripGid(v.id, GID_VARIANT_PREFIX)),
      title: v.title,
      availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable ?? null,
      price: v.price || null,
      compareAtPrice: v.compareAtPrice || null,
      image: v.image || null,
    })),
  }
  return product as IProduct
}

function transformAddonVariants(node: any): AddonVariant[] {
  const productId = Number(stripGid(node.id || '', GID_PRODUCT_PREFIX))
  const variants = node.variants?.nodes || []

  return variants.map((variant: any) => ({
    id: stripGid(variant.id || '', GID_VARIANT_PREFIX),
    addonVariantPrice: variant.price?.amount || '0',
    addonVariantComparedPrice: variant.compareAtPrice?.amount || 0,
    requires_selling_plan: node.requiresSellingPlan || false,
    first_selling_plan_allocation_id: false,
    allowATC: variant.availableForSale,
    title: variant.title,
    product: {
      id: productId,
      handle: node.handle || '',
      title: node.title,
      variantsCount: variants.length,
    },
  }))
}

/**
 * Fetch products by IDs directly from the Shopify Storefront GraphQL API.
 * Skips the app proxy entirely — one fewer network hop.
 *
 * Falls back to null if the storefront token isn't available,
 * allowing the caller to use the proxy as fallback.
 */
export async function fetchProductsByIdsDirect(ids: string[], country: string): Promise<IProduct[] | null> {
  const storefrontToken = window.__onetick_store__?.['storefront'] as string | undefined
  if (!storefrontToken || !ids.length) return null

  const gids = toUniqueProductGids(ids)
  if (!gids.length) return []

  const cacheKey = `direct:${[...gids].sort().join(',')}:${country}`

  if (!cache.has(cacheKey)) {
    const fetchPromise = (async (): Promise<IProduct[] | null> => {
      try {
        // Chunk into batches of 250 (Shopify nodes query limit)
        const results: IProduct[] = []
        for (let i = 0; i < gids.length; i += 250) {
          const batch = gids.slice(i, i + 250)

          const rootPath = window.Shopify?.routes?.root || '/'
          const response = await fetch(`${rootPath}api/${STOREFRONT_API_VERSION}/graphql.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': storefrontToken,
            },
            body: JSON.stringify({
              query: PRODUCTS_BY_IDS_QUERY,
              variables: { ids: batch, country: country || 'US' },
            }),
          })

          if (!response.ok) {
            console.warn('[OneTick] Direct Storefront API failed:', response.status)
            cache.delete(cacheKey)
            return null // Return null so caller falls through to proxy
          }

          const json = await response.json()
          const nodes = json?.data?.nodes || []

          // Filter out null nodes (deleted/unpublished products)
          for (const node of nodes) {
            if (node?.id) results.push(transformProduct(node))
          }
        }

        return results
      } catch (error) {
        console.warn('[OneTick] Direct Storefront API error:', error)
        cache.delete(cacheKey)
        return null // Return null so caller falls through to proxy
      }
    })()

    cache.set(cacheKey, fetchPromise)
  }

  return cache.get(cacheKey) || null
}

export async function fetchAddonVariantsByProductIdsDirect(
  ids: string[],
  country: string,
  limit?: number
): Promise<AddonVariant[] | null> {
  const storefrontToken = window.__onetick_store__?.['storefront'] as string | undefined
  if (!storefrontToken || !ids.length) return null

  const gids = toUniqueProductGids(ids)
  if (!gids.length) return []

  const cacheKey = `direct:addon-variants:${[...gids].sort().join(',')}:${country}:${limit || ''}`

  if (!addonVariantCache.has(cacheKey)) {
    const fetchPromise = (async (): Promise<AddonVariant[] | null> => {
      try {
        const results: AddonVariant[] = []
        for (let i = 0; i < gids.length; i += 250) {
          const batch = gids.slice(i, i + 250)

          const rootPath = window.Shopify?.routes?.root || '/'
          const response = await fetch(`${rootPath}api/${STOREFRONT_API_VERSION}/graphql.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': storefrontToken,
            },
            body: JSON.stringify({
              query: ADDON_VARIANTS_BY_PRODUCT_IDS_QUERY,
              variables: { ids: batch, country: country || 'US' },
            }),
          })

          if (!response.ok) {
            console.warn('[OneTick] Direct add-on variant Storefront API failed:', response.status)
            addonVariantCache.delete(cacheKey)
            return null
          }

          const json = await response.json()
          const nodes = json?.data?.nodes || []

          for (const node of nodes) {
            if (node?.id) results.push(...transformAddonVariants(node))
          }
        }

        return limit ? results.slice(0, limit) : results
      } catch (error) {
        console.warn('[OneTick] Direct add-on variant Storefront API error:', error)
        addonVariantCache.delete(cacheKey)
        return null
      }
    })()

    addonVariantCache.set(cacheKey, fetchPromise)
  }

  return addonVariantCache.get(cacheKey) || null
}
