import { useStore } from '@nanostores/preact'
import { addToCart, type CartItem } from '@stores/cartStore'
import { $dictionary } from '@stores/i18nStore'

import { ShoppingCart } from 'lucide-preact'

import { trackEvent } from '@lib/firebase'

interface AddToCartProps {
  product: CartItem
  lang: 'en' | 'es'
}

export default function AddToCart({ product, lang }: AddToCartProps) {
  const dict = useStore($dictionary)

  if (!product || !product.name || !dict) return null

  const { id, name, price, inStock } = product
  const productName = name[lang]

  const handleAddToCart = () => {
    addToCart(product)

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
      className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-white px-3 py-2 text-sm font-semibold uppercase tracking-wide bg-black text-white rounded-md transition-colors hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-600 disabled:text-zinc-500"
      disabled={!inStock}
    >
      <ShoppingCart size={17} strokeWidth={2} aria-hidden="true" />
      {dict['cart.add']}
    </button>
  )
}
