import { EAPIAppProxyTypes } from '../constants'
import { fetchCreateTimeShopAppProxy } from '../helpers/product-offers/query/fetch-create-time-shop'

const VERSION_V1_CREATED_TIME = '2025-03-05T02:11:25.029+00:00'

function isOldUser(createdAtString: string) {
  // Convert both the cutoff and the user's creation time into Date objects
  const cutoffDate = new Date(VERSION_V1_CREATED_TIME)
  const userDate = new Date(createdAtString)

  // Compare the two dates
  return userDate < cutoffDate
}

export const getTimeCreateShop = async () => {
  const data: any = await fetchCreateTimeShopAppProxy(EAPIAppProxyTypes.GET_CREATE_TIME_SHOP)
  const createdAt = data?.created_at
  return isOldUser(createdAt)
}
