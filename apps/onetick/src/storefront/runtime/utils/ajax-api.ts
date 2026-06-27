export async function addToCart(body: any) {
  return fetch(`${window.Shopify.routes.root}cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then(response => response.json())
    .then(res => {
      if (res?.message && res?.description) {
        console.error(`[OneTick] ${res.description}`)
      }

      return res
    })
}
