import { useStore } from '@nanostores/preact'
import { ShoppingCart, Trash2, X } from 'lucide-preact'
import { useEffect } from 'preact/hooks'

import { cartItems, isCartOpen, removeFromCart } from '@stores/cartStore'

interface Props {
  lang: 'es' | 'en'
}

export default function CartDrawer({ lang }: Props) {
  const items = useStore(cartItems)
  const open = useStore(isCartOpen)
  const isEnglish = lang === 'en'
  const products = Object.values(items).filter((item) => item !== undefined)
  const count = products.reduce((sum, item) => sum + item.quantity, 0)
  const total = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open)
    return () => document.body.classList.remove('overflow-hidden')
  }, [open])

  return (
    <>
      <button
        type="button"
        class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center bg-zinc-950 text-white shadow-lg transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
        aria-label={isEnglish ? 'Open my cart' : 'Abrir mi carrito'}
        aria-expanded={open}
        onClick={() => isCartOpen.set(true)}
      >
        <ShoppingCart size={24} strokeWidth={2} aria-hidden="true" />
        {count ? (
          <span class="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">
            {count}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          class="fixed inset-0 z-40 bg-zinc-950/50"
          onClick={() => isCartOpen.set(false)}
        />
      ) : null}
      <aside
        class={`cart-drawer fixed right-0 top-0 z-50 flex h-full w-[min(24rem,calc(100%-1rem))] flex-col bg-white p-6 transition-transform duration-300 sm:p-8 ${open ? 'is-open' : ''}`}
        aria-label={isEnglish ? 'My Cart' : 'Mi carrito'}
        aria-hidden={!open}
      >
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-medium">
            {isEnglish ? 'My Cart' : 'Mi carrito'}
          </h2>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center border-2 border-zinc-950 transition-colors hover:bg-zinc-950 hover:text-white"
            aria-label={isEnglish ? 'Close my cart' : 'Cerrar mi carrito'}
            onClick={() => isCartOpen.set(false)}
          >
            <X size={22} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <div class="mt-8 flex-1 overflow-y-auto">
          {products.length ? (
            products.map((item) => (
              <article
                key={item.id}
                class="flex gap-3 border-b border-zinc-200 py-4 first:pt-0"
              >
                <img
                  class="h-20 w-20 bg-zinc-100 object-contain"
                  src={item.image.src}
                  alt={item.name[lang]}
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <h3 class="font-medium leading-tight">{item.name[lang]}</h3>
                    <button
                      type="button"
                      class="shrink-0 text-zinc-500 transition-colors hover:text-rose-600"
                      aria-label={`${isEnglish ? 'Remove' : 'Eliminar'} ${item.name[lang]}`}
                      onClick={() => void removeFromCart(item.id)}
                    >
                      <Trash2 size={19} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                  <p class="mt-2 text-sm text-zinc-500">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <p class="text-lg font-light">
              {isEnglish ? 'Cart is empty' : 'El carrito está vacío'}
            </p>
          )}
        </div>
        <div class="mt-6 flex items-center justify-between border-t-2 border-zinc-950 pt-4 text-lg font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <a
          href={isEnglish ? '/en/buy' : '/buy'}
          class="mt-4 block bg-zinc-950 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-zinc-700"
        >
          {isEnglish ? 'Buy' : 'Comprar'}
        </a>
      </aside>
    </>
  )
}
