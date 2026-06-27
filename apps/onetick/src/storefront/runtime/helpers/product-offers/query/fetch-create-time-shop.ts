import { type EAPIAppProxyTypes } from '../../../constants'
import { getOneTickAppProxyPath } from '../../../utils/app-proxy-path'

export const fetchCreateTimeShopAppProxy = async (type: EAPIAppProxyTypes, options?: any) => {
  const fetchPromise = new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('body', JSON.stringify({ options }))
    formData.append('public', 'true')
    formData.append('type', type)

    return fetch(getOneTickAppProxyPath(), {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(res => resolve(res.data))
      .catch(e => reject(e))
  })

  return fetchPromise
}
