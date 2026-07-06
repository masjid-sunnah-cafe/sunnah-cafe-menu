import DishCard from './DishCard'
import { UI, getDishesText } from '../data/menu'

export default function DishGrid({ dishes, categoryLabel, onOpen, lang }) {
  if (dishes.length === 0) {
    return <p className="py-16 text-center text-brand-text-muted">{UI.noDishes[lang]}</p>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 md:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between px-1">
        <h2 className="font-serif text-[26px] font-bold text-brand-dark md:text-3xl">
          {categoryLabel}
        </h2>
        <div className="flex flex-col items-center">
          <span className="text-[13px] font-medium text-brand-green">
            {getDishesText(lang, dishes.length)}
          </span>
          <div className="mt-1 flex w-full min-w-[50px] items-center">
            <div className="h-px flex-1 bg-brand-border"></div>
            <div className="mx-1 h-1.5 w-1.5 rotate-45 border border-brand-green bg-brand-gold"></div>
            <div className="h-px flex-1 bg-brand-border"></div>
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
