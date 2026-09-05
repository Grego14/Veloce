import { atom, map } from 'nanostores'
import type { CollectionEntry } from 'astro:content'

export type ProductData = CollectionEntry<'products'>['data']

export interface CartItem extends ProductData {
  quantity: number
}

export const isCartOpen = atom(false)

export const cartItems = map<Record<string, CartItem | undefined>>({})

export function addToCart(product: ProductData) {
  const productId = product.id
  const currentItems = cartItems.get()
  const existingItem = currentItems[productId]

  if (existingItem) {
    cartItems.setKey(productId, {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    })
  } else {
    cartItems.setKey(productId, {
      ...product,
      quantity: 1,
    })
  }

  // open the cart on add
  isCartOpen.set(true)
}

export function removeFromCart(productId: string) {
  cartItems.setKey(productId, undefined)
}
