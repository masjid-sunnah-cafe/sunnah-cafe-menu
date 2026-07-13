import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { UI } from '../data/i18n'

const listVariants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
}

const itemVariants = {
  closed: { opacity: 0, x: -16 },
  open: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
}

export default function MobileNav({ open, onClose, lang, categories, activeCategory, onCategory }) {
  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-brand-dark/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        >
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={UI.categoriesLabel[lang]}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-[78%] max-w-[320px] flex-col bg-brand-bg px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-6 shadow-2xl shadow-brand-dark/30"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-[13px] font-bold uppercase tracking-[0.18em] text-brand-text-muted">
                {UI.categoriesLabel[lang]}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label={UI.close[lang]}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-gold/50 text-brand-text-muted hover:border-brand-gold hover:text-brand-text-dark"
              >
                ✕
              </button>
            </div>

            <motion.ul
              initial="closed"
              animate="open"
              variants={listVariants}
              className="mt-4 flex flex-col gap-2"
            >
              {categories.map((cat) => {
                const active = cat.id === activeCategory
                return (
                  <motion.li key={cat.id} variants={itemVariants}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        onCategory(cat.id)
                        onClose()
                      }}
                      className={
                        'w-full rounded-xl px-4 py-3 text-left font-display text-[15px] font-semibold transition-colors ' +
                        (active
                          ? 'bg-brand-dark text-white'
                          : 'text-brand-text-dark hover:bg-brand-border')
                      }
                    >
                      {cat.label[lang]}
                    </button>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
