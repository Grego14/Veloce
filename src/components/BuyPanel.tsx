import { useStore } from '@nanostores/preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { auth, db, trackEvent } from '@lib/firebase'
import { cartItems, clearCart, removeFromCart } from '@stores/cartStore'
import { ensureAnonymousUser } from '@stores/authStore'
import { $dictionary, setLanguage } from '@stores/i18nStore'

interface Props {
  lang: 'es' | 'en'
}

export default function BuyPanel({ lang }: Props) {
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

  useEffect(() => {
    if (!$dictionary.get()) setLanguage(lang)
  }, [lang])

  if (!dictionary) {
    return <div class="mt-8 h-96 animate-pulse bg-zinc-100" aria-busy="true" />
  }

  const applyDiscount = async () => {
    setMessage('')
    if (code.trim().toUpperCase() !== 'VELOCE26') return
    const used = await getDoc(doc(db, 'promoCodes', 'VELOCE26'))
    if (used.exists()) {
      setDiscountApplied(false)
      setMessage(dictionary['buy.usedCode'] as string)
      return
    }
    setDiscountApplied(true)
  }

  const purchase = async () => {
    if (!products.length) return
    if (discountApplied) {
      const user = auth.currentUser ?? (await ensureAnonymousUser())
      if (!user) return
      const used = await getDoc(doc(db, 'promoCodes', 'VELOCE26'))
      if (used.exists()) {
        setDiscountApplied(false)
        setMessage(dictionary['buy.usedCode'] as string)
        return
      }
      await setDoc(doc(db, 'promoCodes', 'VELOCE26'), {
        uid: user.uid,
        used: true,
      })
    }
    trackEvent('purchase', { currency: 'USD', value: subtotal - discount })
    await clearCart()
    dialog.current?.showModal()
  }

  return (
    <>
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
                <h3 class="font-medium">{item.name[lang]}</h3>
                <p class="mt-1 text-sm text-zinc-500">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                class="self-start text-sm font-semibold underline"
                onClick={async () => {
                  await removeFromCart(item.id)
                }}
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
            class="border-2 border-zinc-950 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-zinc-950 hover:text-white"
            onClick={async () => {
              await applyDiscount()
            }}
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
          class="mt-5 w-full bg-zinc-950 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-300"
          disabled={!products.length}
          onClick={async () => {
            await purchase()
          }}
        >
          {dictionary['buy.purchase']}
        </button>
      </div>
      <dialog
        ref={dialog}
        class="w-[min(24rem,calc(100%-2rem))] border-2 border-zinc-950 p-8 text-center"
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
