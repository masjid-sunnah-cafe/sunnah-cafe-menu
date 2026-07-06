import { motion } from 'framer-motion'
import { UI } from '../data/menu'

export default function DishCard({ dish, onOpen, lang }) {
  function activate(e) {
    onOpen(dish, e.currentTarget)
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      aria-label={`${dish.name[lang]}, $${dish.price.toFixed(2)}`}
      onClick={activate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          activate(e)
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-brand-border bg-brand-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-dark/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-gold"
    >
      {/* Image with inner padding */}
      <div className="p-2.5 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-gold/20 border border-brand-border/40">
          {/* Top patterned strip */}
          <div className="absolute left-0 right-0 top-0 z-10 h-3 opacity-100" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='12' viewBox='0 0 16 12' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='12' fill='%23F2EBE1'/%3E%3Cpolygon points='0,12 8,0 16,12' fill='%239A3A26'/%3E%3Cpolygon points='4,12 8,6 12,12' fill='%23D9A752'/%3E%3C/svg%3E")`,
            backgroundSize: '16px 12px',
          }} />
          <img
            src={dish.image}
            alt={dish.name[lang]}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 pt-2.5 md:px-4 md:pb-4 md:pt-3">
        <h3 className="font-serif text-[14px] font-bold leading-snug text-brand-green md:text-[16px]">
          {dish.name[lang]}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-brand-text-muted md:text-xs">
          {dish.description[lang]}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[15px] font-bold text-brand-text-dark md:text-base">
            ${dish.price.toFixed(2)}
          </span>
          {dish.isPopular && (
            <span className="rounded-full bg-brand-orange px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white md:text-[10px]">
              {UI.popular[lang]}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
