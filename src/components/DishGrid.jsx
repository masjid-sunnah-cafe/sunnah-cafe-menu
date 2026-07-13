import DishCard from './DishCard'
import { UI, getDishesText } from '../data/i18n'
import { Separator } from './ui/separator'

export default function DishGrid({ dishes, categoryLabel, onOpen, lang, noResults }) {
  if (dishes.length === 0) {
    return (
      <p className="py-16 text-center text-brand-text-muted">
        {noResults ? UI.noResults[lang] : UI.noDishes[lang]}
      </p>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 md:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between px-1">
        <h2 className="font-display text-[26px] font-bold text-brand-dark md:text-3xl">
          {categoryLabel}
        </h2>
        <div className="flex flex-col items-center">
          <span className="text-[13px] font-medium text-brand-green">
            {getDishesText(lang, dishes.length)}
          </span>
          <div className="mt-1 flex w-full min-w-[50px] items-center gap-1">
            <Separator className="flex-1" />
            <div className="h-1.5 w-1.5 rotate-45 border border-brand-green bg-brand-gold" />
            <Separator className="flex-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} onOpen={onOpen} lang={lang} />
        ))}
      </div>
    </main>
  )
}
