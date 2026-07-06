import { motion } from 'framer-motion'

/* Colored dot/diamond shapes matching the mockup */
const SHAPE_MAP = {
  'food': <svg className="h-4 w-4 text-brand-orange" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 8c-2.21 0-4 1.79-4 4s1.79 4 4 4h12c2.21 0 4-1.79 4-4s-1.79-4-4-4H6zm6 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>,
  'pastry': <svg className="h-4 w-4 text-brand-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2zm0 14.5L7.5 12 12 7.5 16.5 12 12 16.5z"/></svg>,
  'desserts': <svg className="h-4 w-4 text-brand-red" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6L12 2z"/></svg>,
  'warm-drinks': <svg className="h-4 w-4 text-brand-orange" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2c0 0-4.5 3.5-4.5 8 0 2.5 1.5 4.7 3.7 5.6C10 13.9 11.5 12 11.5 12s2 1.5 2 3.5c0 .7-.2 1.3-.5 1.9 1.7-.8 3-2.6 3-4.9 0-4.5-4.5-10.5-4.5-10.5z"/></svg>,
  'cold-drinks': <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9 8H3l4.5 4.5L6 19l6-4.5L18 19l-1.5-6.5L21 8h-6L12 2z"/></svg>,
}

export default function CategoryTabs({ categories, activeCategory, onSelect, lang }) {
  return (
    <nav className="px-4 py-4 md:px-6 md:py-5">
      <div className="mx-auto max-w-5xl">
        <div
          role="tablist"
          aria-label="Menu categories"
          className="flex gap-3 overflow-x-auto no-scrollbar pb-1 md:justify-center"
        >
        {categories.map((cat) => {
          const active = cat.id === activeCategory
          return (
            <motion.button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(cat.id)}
              whileTap={{ scale: 0.96 }}
              className={
                'flex items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors md:px-6 md:py-3 md:text-base ' +
                (active
                  ? 'bg-brand-green text-brand-card shadow-md'
                  : 'border border-brand-border bg-brand-card text-brand-text-dark hover:border-brand-gold/40')
              }
            >
              {SHAPE_MAP[cat.id] || <span className="inline-block h-3 w-3 rounded-full bg-brand-gold" />}
              <span>{cat.label[lang]}</span>
            </motion.button>
          )
        })}
        </div>
      </div>
    </nav>
  )
}
