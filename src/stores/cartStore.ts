import { atom, map } from 'nanostores'
import type { CollectionEntry } from 'astro:content'
import {
  syncRemoteCart,
  fetchRemoteCart,
  logAddToCartEvent,
} from '@lib/cartSync'
import { auth } from '@lib/firebase'
import { ensureAnonymousUser } from '@stores/authStore'

export type ProductData = CollectionEntry<'products'>['data'][number]

export interface CartItem extends ProductData {
  quantity: number
}

export const isCartOpen = atom(false)

function getInitialCart(): Record<string, CartItem> {
  if (typeof localStorage === 'undefined') return {}

  const saved = localStorage.getItem('veloce-cart')
  if (!saved) return {}

  try {
    return JSON.parse(saved)
  } catch {
    return {}
  }
}

export const cartItems =
  map<Record<string, CartItem | undefined>>(getInitialCart())

const storageKey = 'veloce-cart'

function persistLocal() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(storageKey, JSON.stringify(cartItems.get()))
}

export async function hydrateRemoteCart(): Promise<void> {
  const remote = await fetchRemoteCart<CartItem>()

  if (remote) {
    cartItems.set(remote)
    persistLocal()
  } else {
    await syncRemoteCart(cartItems.get())
  }
}

export async function addToCart(
  product: ProductData,
  lang: 'es' | 'en'
): Promise<void> {
  const productId = product?.id
  const currentItems = cartItems.get()
  const existingItem = currentItems[productId]
  const productName = product.name[lang]

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

  persistLocal()

  const user = auth.currentUser ?? (await ensureAnonymousUser())

  if (user) {
    await syncRemoteCart(cartItems.get())
    logAddToCartEvent({
      name: productName,
      id: product.id,
      price: product.price,
    })
  }
}

export async function removeFromCart(productId: string): Promise<void> {
  cartItems.setKey(productId, undefined)
  persistLocal()

  await syncRemoteCart(cartItems.get())
}

export async function clearCart(): Promise<void> {
  cartItems.set({})
  persistLocal()

  await syncRemoteCart(cartItems.get())
}
