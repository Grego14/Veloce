import { useStore } from '@nanostores/preact'
import { useRef, useState } from 'preact/hooks'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirestoreMethods } from '@lib/cartSync'

import { trackEvent } from '@lib/firebase'
import { cartItems, clearCart, removeFromCart } from '@stores/cartStore'
import { ensureAnonymousUser, $user } from '@stores/authStore'
import { $dictionary } from '@stores/i18nStore'

interface Props {
  lang: 'es' | 'en'
}

export default function BuyPanel({ lang }: Props) {
  let user = useStore($user)
  const items = useStore(cartItems)
  const dictionary = useStore($dictionary)

  const dialog = useRef<HTMLDialogElement>(null)

  const [code, setCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [message, setMessage] = useState('')

  const products = Object.values(items).filter((item) => item !== undefined)
  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const discount = discountApplied ? subtotal * 0.15 : 0

  if (!dictionary) return null

  const applyDiscount = async () => {
    setMessage('')

    if (!user) {
      user = await ensureAnonymousUser()
    }

    if (code.trim().toUpperCase() !== 'VELOCE26' || !user?.uid) return

    const { db } = await getFirestoreMethods()
    const snapshot = await getDoc(doc(db, 'users', user.uid))

    if (snapshot.exists()) {
      const used = snapshot.data().promoCodes?.includes('VELOCE26')

      if (used) {
        setDiscountApplied(false)
        setMessage(dictionary['buy.usedCode'] as string)
        return
      }
    }

    setDiscountApplied(true)
  }

  const purchase = async () => {
    if (!user) {
      user = await ensureAnonymousUser()
    }

    if (!products.length || !user) return

    if (discountApplied) {
      const { db, arrayUnion } = await getFirestoreMethods()
      const snapshot = await getDoc(doc(db, 'users', user.uid))

      if (snapshot.exists()) {
        const used = snapshot.data().promoCodes?.includes('VELOCE26')

        if (used) {
          setDiscountApplied(false)
          setMessage(dictionary['buy.usedCode'] as string)
          return
        }
      }

      await setDoc(doc(db, 'users', user.uid), {
        promoCodes: arrayUnion('VELOCE26'),
      })
    }

    trackEvent('purchase', { currency: 'USD', value: subtotal - discount })
    await clearCart()
    dialog.current?.showModal()
  }

  const handlePurchase = async () => await purchase()
  const handleDiscount = async () => await applyDiscount()
  const handleRemove = async (id: string) => await removeFromCart(id)

  return (
    <>
      <section class="max-w-xl mx-auto">
        <div class="mt-8 space-y-4">
          {products.length ? (
            products.map((item) => (
              <article
                key={item.id}
                class="flex gap-4 border-b border-zinc-200 pb-4"
              >
                <img
                  class="h-24 w-24 bg-zinc-100 object-contain"
                  src={item.image.src}
                  alt={item.name[lang]}
                />
                <div class="min-w-0 flex-1">
                  <h3 class="font-medium text-md sm:text-lg md:text-xl">
                    {item.name[lang]}
                  </h3>
                  <p class="mt-1 text-sm text-zinc-500">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  class="self-start text-sm font-semibold underline"
                  onClick={() => handleRemove(item.id)}
                >
                  {dictionary['buy.remove']}
                </button>
              </article>
            ))
          ) : (
            <p class="text-lg font-light">{dictionary['cart.empty']}</p>
          )}
        </div>

        <div class="mt-8 border-t-2 border-zinc-950 pt-5">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input
              class="min-w-0 flex-1 border-2 border-zinc-950 px-3 py-3"
              placeholder={dictionary['buy.discountCode']}
              value={code}
              onInput={(event) => setCode(event.currentTarget.value)}
            />
            <button
              type="button"
              class="btn-secondary max-w-30"
              onClick={handleDiscount}
              disabled={!code}
            >
              {dictionary['buy.apply']}
            </button>
          </div>

          {message ? <p class="mt-2 text-sm text-rose-600">{message}</p> : null}

          <div class="mt-5 flex justify-between text-lg font-semibold">
            <span>{dictionary['cart.total']}</span>
            <span>${(subtotal - discount).toFixed(2)}</span>
          </div>

          {discountApplied ? (
            <div class="mt-2 flex justify-between text-lg font-semibold text-emerald-700">
              <span>{dictionary['buy.discount']}</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          ) : null}

          <button
            type="button"
            class="btn-primary mt-5"
            disabled={!products.length}
            onClick={handlePurchase}
          >
            {dictionary['buy.purchase']}
          </button>
        </div>
      </section>

      <dialog
        ref={dialog}
        class="w-[min(24rem,calc(100%-2rem))] border-2 border-zinc-950 p-8 text-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <p class="text-2xl font-medium">{dictionary['buy.success']}</p>
        <button
          type="button"
          class="mt-6 border-2 border-zinc-950 px-5 py-2 text-sm font-semibold uppercase"
          onClick={() => dialog.current?.close()}
        >
          OK
        </button>
      </dialog>
    </>
  )
}
