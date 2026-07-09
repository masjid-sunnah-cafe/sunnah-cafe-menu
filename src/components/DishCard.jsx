import { motion } from 'framer-motion'
import { UI, getL10n } from '../data/i18n'
import { Badge } from './ui/badge'

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
      aria-label={`${getL10n(dish.name, lang)}, $${dish.price.toFixed(2)}`}
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border/40 bg-brand-gold/20">
          <img
            src={dish.image}
            alt={getL10n(dish.name, lang)}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-3 pb-3 pt-2.5 md:px-4 md:pb-4 md:pt-3">
        <h3 className="font-display text-[14px] font-bold leading-snug text-brand-green md:text-[16px]">
          {getL10n(dish.name, lang)}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-brand-text-muted md:text-xs">
          {getL10n(dish.description, lang)}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-display text-[15px] font-bold text-brand-text-dark md:text-base">
            ${dish.price.toFixed(2)}
          </span>
          {dish.isPopular && (
            <Badge variant="popular">{UI.popular[lang]}</Badge>
          )}
        </div>
      </div>
    </motion.article>
  )
}
