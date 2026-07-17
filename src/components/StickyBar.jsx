import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UI } from '../data/i18n'
import { useCart } from '../hooks/useCart'
import MobileNav from './MobileNav'

function Hamburger({ open, onClick, label }) {
  const line = 'absolute left-2.5 h-[2px] w-6 rounded-full bg-brand-text-muted'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      className="relative h-11 w-11 flex-none rounded-full border border-brand-gold/50 bg-brand-bg md:hidden"
    >
      <motion.span
        className={line}
        animate={open ? { y: 0, rotate: 45 } : { y: -7, rotate: 0 }}
        style={{ top: 'calc(50% - 1px)' }}
        transition={{ duration: 0.22 }}
      />
      <motion.span
        className={line}
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        style={{ top: 'calc(50% - 1px)' }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className={line}
        animate={open ? { y: 0, rotate: -45 } : { y: 7, rotate: 0 }}
        style={{ top: 'calc(50% - 1px)' }}
        transition={{ duration: 0.22 }}
      />
    </button>
  )
}

export default function StickyBar({ lang, query, onQuery, categories, activeCategory, onCategory }) {
  const [navOpen, setNavOpen] = useState(false)
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const activeCat = categories.find((c) => c.id === activeCategory)

  return (
    <div className="sticky top-0 z-40 border-b border-brand-border bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Hamburger
            open={navOpen}
            onClick={() => setNavOpen(true)}
            label={UI.categoriesLabel[lang]}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={UI.searchPlaceholder[lang]}
            aria-label={UI.searchPlaceholder[lang]}
            enterKeyHint="search"
            className="w-full rounded-full border border-brand-gold/40 bg-brand-card px-5 py-3 font-body text-[16px] text-brand-text-dark placeholder-brand-text-muted/70 outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={() => navigate('/cart')}
            aria-label={`${UI.cart[lang]} (${itemCount})`}
            className="relative grid h-11 w-11 flex-none place-items-center rounded-full border border-brand-gold/50 bg-brand-card text-brand-text-dark"
          >
            <ShoppingBag size={20} aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-red px-1 text-[11px] font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Current category hint on mobile */}
        {activeCat && (
          <p className="mt-2 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-brand-text-muted md:hidden">
            {activeCat.label[lang]}
          </p>
        )}

        {/* Inline tabs on desktop */}
        <div
          role="tablist"
          aria-label={UI.categoriesLabel[lang]}
          className="mt-3 hidden gap-2 md:flex md:justify-center"
        >
          {categories.map((cat) => {
            const active = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onCategory(cat.id)}
                className={
                  'min-h-[44px] flex-none whitespace-nowrap rounded-full border px-4 font-display text-sm font-bold transition-colors ' +
                  (active
                    ? 'border-brand-dark bg-brand-dark text-white'
                    : 'border-brand-gold/40 bg-brand-card text-brand-text-dark hover:border-brand-gold')
                }
              >
                {cat.label[lang]}
              </button>
            )
          })}
        </div>
      </div>

      <MobileNav
        open={navOpen}
        onClose={() => setNavOpen(false)}
        lang={lang}
        categories={categories}
        category={activeCategory}
        activeCategory={activeCategory}
        onCategory={onCategory}
      />
    </div>
  )
}
