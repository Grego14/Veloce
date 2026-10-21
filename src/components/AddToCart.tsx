import { useStore } from '@nanostores/preact'
import type { CartItem } from '@stores/cartStore'
import { $dictionary } from '@stores/i18nStore'

import ShoppingCart from '@icons/ShoppingCart'

import { trackEvent } from '@lib/firebase'

interface AddToCartProps {
  product: CartItem
  lang: 'en' | 'es'
}

export default function AddToCart({ product, lang }: AddToCartProps) {
  const dict = useStore($dictionary)

  if (!product || !product.name || !dict) return null

  const handleAddToCart = async () => {
    const { id, name, price } = product
    const productName = name[lang]

    const { addToCart } = await import('@stores/cartStore')
    addToCart(product, lang)

    trackEvent('add_to_cart', {
      currency: 'USD',
      value: product.price,
      items: [
        {
          item_id: id,
          item_name: productName,
          price: price,
          quantity: 1,
        },
      ],
    })
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-950 bg-zinc-950 px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
      disabled={!product.inStock}
    >
      <ShoppingCart className="h-4 w-4" />
      {dict['cart.add']}
    </button>
  )
}
