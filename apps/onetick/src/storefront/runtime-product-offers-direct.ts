// OneTick storefront runtime runs from the generated theme asset and must fail open on merchant storefronts.
import type { OneTickUnknownRecord } from './runtime-types'

export interface OneTickProductOfferVariant {
  id: number; title: string; availableForSale: boolean; quantityAvailable?: number | null
  price: { amount: string; currencyCode: string } | null; compareAtPrice: { amount: string; currencyCode: string } | null
  image: { url: string } | null
}

export interface OneTickProductOfferProduct {
  id: string; title: string; availableForSale: boolean; requiresSellingPlan: boolean; tags: string[]
  vendor: string; productType: string; featuredImage: { url: string; altText: string; width: number }
  collections: string[]; variants: OneTickProductOfferVariant[]
}

interface ResolveSpecificProductOfferRecommendationsOptions {
  windowRef: Window; productOfferId: string; triggerProductIds: string[]; country?: string
}

interface OneTickProductOfferCondition extends OneTickUnknownRecord {
  ct?: string; mcic?: boolean; poid?: string; tp?: string[]; tpt?: string; op?: string[]; opt?: string; isDraft?: boolean
}

const apiVersion = '2025-10'
const gidProductPrefix = 'gid://shopify/Product/'
const gidVariantPrefix = 'gid://shopify/ProductVariant/'
const gidCollectionPrefix = 'gid://shopify/Collection/'
const cache = new Map<string, Promise<OneTickProductOfferProduct[] | null>>()
const supportedOfferSources = ['specific-products', 'products-with-tags', 'products-from-vendors', 'products-of-product-types', 'products-from-collections']

const productFields = `id title featuredImage { url altText width } tags vendor productType availableForSale requiresSellingPlan
collections(first: 250) { nodes { id } }
variants(first: 250) { nodes { id title availableForSale quantityAvailable price { amount currencyCode } compareAtPrice { amount currencyCode } image { url } } }`
const productsByIdsQuery = `query getProductsByIds($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
  nodes(ids: $ids) { ... on Product { ${productFields} } }
}`
const productsByQuery = `query getProductsByQuery($first: Int!, $query: String!, $country: CountryCode!) @inContext(country: $country) {
  products(first: $first, query: $query) { nodes { ${productFields} } }
}`
const productsByCollectionIdsQuery = `query getProductsByCollectionIds($ids: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
  nodes(ids: $ids) { ... on Collection { products(first: 250) { nodes { ${productFields} } } } }
}`

const stripGid = (gid: string, prefix: string) => gid.replace(prefix, '')
const toProductGid = (id: string) => (id.startsWith('gid://') ? id : `${gidProductPrefix}${id}`)
const toCollectionGid = (id: string) => (id.startsWith('gid://') ? id : `${gidCollectionPrefix}${id}`)
const parseCondition = (condition: OneTickUnknownRecord): OneTickProductOfferCondition =>
  typeof condition === 'string' ? JSON.parse(condition) : condition

function transformProduct(node: any): OneTickProductOfferProduct {
  return {
    id: stripGid(node.id, gidProductPrefix),
    title: node.title,
    availableForSale: node.availableForSale,
    requiresSellingPlan: node.requiresSellingPlan,
    tags: node.tags || [],
    vendor: node.vendor || '',
    productType: node.productType || '',
    featuredImage: node.featuredImage || { url: '', altText: '', width: 0 },
    collections: (node.collections?.nodes || []).map((collection: { id: string }) =>
      stripGid(collection.id, gidCollectionPrefix)
    ),
    variants: (node.variants?.nodes || []).map((variant: any) => ({
      id: Number(stripGid(variant.id, gidVariantPrefix)),
      title: variant.title,
      availableForSale: variant.availableForSale,
      quantityAvailable: variant.quantityAvailable ?? null,
      price: variant.price || null,
      compareAtPrice: variant.compareAtPrice || null,
      image: variant.image || null,
    })),
  }
}

export async function fetchProductsByIdsDirect(windowRef: Window, ids: string[], country = 'US'): Promise<OneTickProductOfferProduct[] | null> {
  if (!ids.length) return null
  return postProducts(windowRef, `direct:${[...ids].sort().join(',')}:${country}`, {
    query: productsByIdsQuery,
    variables: { ids: ids.map(toProductGid), country },
  }, json => json?.data?.nodes || [])
}

async function fetchProductsByQueryDirect(windowRef: Window, query: string, country = 'US') {
  if (!query) return null
  return postProducts(windowRef, `query:${query}:${country}`, {
    query: productsByQuery,
    variables: { first: 250, query, country },
  }, json => json?.data?.products?.nodes || [])
}

async function fetchProductsByCollectionIdsDirect(windowRef: Window, ids: string[], country = 'US') {
  if (!ids.length) return null
  return postProducts(windowRef, `collections:${[...ids].sort().join(',')}:${country}`, {
    query: productsByCollectionIdsQuery,
    variables: { ids: ids.map(toCollectionGid), country },
  }, json => (json?.data?.nodes || []).flatMap((node: any) => node?.products?.nodes || []))
}

async function postProducts(
  windowRef: Window,
  cacheKey: string,
  body: Record<string, unknown>,
  pickNodes: (json: any) => any[]
) {
  const storefrontToken = windowRef.__onetick_store__?.storefront
  if (!storefrontToken) return null
  // Cache in-flight Storefront API reads by condition/source so multiple product-offer elements do
  // not fan out duplicate GraphQL requests on the same page.
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, (async () => {
      const rootPath = (windowRef as any).Shopify?.routes?.root || '/'
      const response = await windowRef.fetch(`${rootPath}api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        cache.delete(cacheKey)
        return null
      }
      const json = await response.json()
      return dedupeProducts(pickNodes(json).filter((node: any) => node?.id).map(transformProduct))
    })())
  }

  return cache.get(cacheKey) || null
}

const dedupeProducts = (products: OneTickProductOfferProduct[]) =>
  [...new Map(products.map(product => [product.id, product])).values()]

export async function resolveSpecificProductOfferRecommendations({
  windowRef,
  productOfferId,
  triggerProductIds,
  country = 'US',
}: ResolveSpecificProductOfferRecommendationsOptions): Promise<OneTickProductOfferProduct[]> {
  const conditions = (Object.values(windowRef.__onetick_store__?.conditions || {}) as OneTickUnknownRecord[])
    .map(parseCondition)
    .filter(parsed => {
      if (parsed?.isDraft || parsed?.poid !== productOfferId) return false
      return parsed?.ct === 'products-in-cart' && supportedOfferSources.includes(parsed?.opt || '')
    })

  let triggerProducts: Promise<OneTickProductOfferProduct[] | null> | null = null
  const getTriggerProducts = () => {
    triggerProducts ||= fetchProductsByIdsDirect(windowRef, triggerProductIds, country)
    return triggerProducts
  }

  for (const condition of conditions) {
    const containsTrigger = await conditionContainsTrigger(condition, triggerProductIds, getTriggerProducts)
    if (containsTrigger === condition.mcic) {
      return (await fetchOfferProductsForCondition(windowRef, condition, country)) || []
    }
  }

  return []
}

async function fetchOfferProductsForCondition(windowRef: Window, condition: OneTickProductOfferCondition, country: string) {
  if (condition.opt === 'specific-products') return fetchProductsByIdsDirect(windowRef, condition.op || [], country)
  if (condition.opt === 'products-from-collections') {
    return fetchProductsByCollectionIdsDirect(windowRef, condition.op || [], country)
  }
  const field = condition.opt === 'products-with-tags'
    ? 'tag'
    : condition.opt === 'products-from-vendors'
      ? 'vendor'
      : 'product_type'
  const groups = await Promise.all((condition.op || []).map(value => fetchProductsByQueryDirect(windowRef, `${field}:${value}`, country)))
  return dedupeProducts(groups.flatMap(group => group || []))
}

async function conditionContainsTrigger(
  condition: OneTickProductOfferCondition,
  triggerProductIds: string[],
  getTriggerProducts: () => Promise<OneTickProductOfferProduct[] | null>
) {
  // Conditions can target an explicit product list or product attributes of current cart/PDP
  // triggers. Attribute matching requires hydrating trigger products through Storefront API.
  if (condition.tpt === 'from-custom-list') return triggerProductIds.some(id => condition.tp?.includes(id))
  const products = (await getTriggerProducts()) || []
  return products.some(product => productMatchesTrigger(product, condition))
}

function productMatchesTrigger(product: OneTickProductOfferProduct, condition: OneTickProductOfferCondition) {
  const triggerValues = condition.tp || []
  switch (condition.tpt) {
    case 'with-tags':
      return triggerValues.some(tag => product.tags?.includes(tag))
    case 'from-vendors':
      return triggerValues.includes(product.vendor)
    case 'of-products-types':
      return triggerValues.includes(product.productType)
    case 'from-collections':
      return triggerValues.some(collectionId => product.collections?.includes(collectionId))
    default:
      return false
  }
}
