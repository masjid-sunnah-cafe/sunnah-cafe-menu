import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import zahiibaLogo from '../assets/images/Zahiiba.png'
import { UI } from '../data/menu'

const ALLERGEN_STYLE = {
  wheat:  'border-tag-text-red/30 bg-tag-bg-red text-tag-text-red',
  dairy:  'border-tag-text-red/30 bg-tag-bg-red text-tag-text-red',
  shared: 'border-tag-text-red/30 bg-tag-bg-red text-tag-text-red',
}

function Tag({ children, className = '' }) {
  return (
    <span className={'inline-block rounded-full border px-3 py-1 text-xs font-medium ' + className}>
      {children}
    </span>
  )
}

export default function DishDetailSheet({ dish, onClose, lang }) {
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!dish) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    sheetRef.current?.querySelector('button')?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = sheetRef.current?.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [dish, onClose])

  if (!dish) return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-brand-dark/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        ref={sheetRef}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={dish.name[lang]}
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-[calc(100%-2rem)] max-w-[480px] overflow-hidden rounded-3xl bg-brand-card shadow-2xl shadow-brand-dark/20 md:my-8 lg:my-12 lg:max-w-[520px]"
      >
        {/* Close X button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-brand-text-dark shadow-md backdrop-blur transition-colors hover:bg-white md:h-10 md:w-10"
        >
          ✕
        </button>

        {/* Header with brand */}
        <div className="flex items-center gap-2 px-5 pt-5 pb-3 md:px-6 md:pt-6">
          <img src={zahiibaLogo} alt="" className="h-8 w-8 rounded-full object-cover" />
          <p className="font-serif text-lg italic text-brand-text-muted">Zahiiba</p>
        </div>

        {/* Hero image */}
        <div className="px-5 md:px-6">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={dish.image}
              alt={dish.name[lang]}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute bottom-3 right-3 h-12 w-12 overflow-hidden rounded-full border-2 border-white/60 shadow-lg">
              <img src={zahiibaLogo} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-8 md:px-6 md:pt-6 md:pb-10">
          {/* Title & price */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-serif text-2xl font-bold leading-tight text-brand-text-dark md:text-[28px]">
              {dish.name[lang]}
            </h2>
            <span className="whitespace-nowrap rounded-xl bg-brand-gold/20 px-3 py-1 text-lg font-bold text-brand-gold md:text-xl">
              ${dish.price.toFixed(2)}
            </span>
          </div>

          <p className="mt-1 text-sm text-brand-text-muted">{dish.subtitle[lang]}</p>
          <p className="mt-3 text-sm leading-[1.7] text-brand-text-dark md:text-[15px]">
            {dish.longDescription[lang]}
          </p>

          {/* Ingredients */}
          <h3 className="mt-6 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
            {UI.ingredientsLabel[lang]}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dish.ingredients[lang].map((ing) => (
              <Tag key={ing} className="border-brand-border bg-brand-bg text-brand-text-dark">{ing}</Tag>
            ))}
          </div>

          {/* Allergens */}
          {dish.allergens.length > 0 && (
            <>
              <h3 className="mt-6 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                {UI.allergensLabel[lang]}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {dish.allergens.map((a) => (
                  <Tag key={a.label[lang]} className={ALLERGEN_STYLE[a.color] || ''}>
                    {a.label[lang]}
                  </Tag>
                ))}
              </div>
            </>
          )}

          {/* Good to know */}
          <h3 className="mt-6 text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
            {UI.goodToKnowLabel[lang]}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dish.meta.halal && (
              <Tag className="border-halal/30 bg-halal-bg font-semibold text-halal">Halal</Tag>
            )}
            <Tag className="border-brand-border bg-brand-bg text-brand-text-dark">{dish.meta.spice[lang]}</Tag>
            <Tag className="border-brand-border bg-brand-bg text-brand-text-dark">{dish.meta.serves[lang]}</Tag>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-8 w-full rounded-2xl bg-brand-dark py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-brand-text-dark md:py-4 md:text-base"
          >
            {UI.backToMenu[lang]}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
