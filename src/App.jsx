import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { categories, dishes } from './data/menu'
import Header from './components/Header'
import PatternBorder from './components/PatternBorder'
import CategoryTabs from './components/CategoryTabs'
import DishGrid from './components/DishGrid'
import DishDetailSheet from './components/DishDetailSheet'

export default function App() {
  const [lang, setLang] = useState('EN')
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [openItemId, setOpenItemId] = useState(null)
  const openerRef = useRef(null)

  const filteredDishes = useMemo(
    () => dishes.filter((d) => d.category === activeCategory),
    [activeCategory],
  )

  const activeCategoryLabel = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.label[lang] || '',
    [activeCategory, lang],
  )

  const openItem = dishes.find((d) => d.id === openItemId) ?? null

  function handleOpen(item, cardEl) {
    openerRef.current = cardEl
    setOpenItemId(item.id)
  }

  function handleClose() {
    setOpenItemId(null)
    openerRef.current?.focus()
    openerRef.current = null
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-brand-bg pb-16">
        {/* Heritage Body Watermark */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231C120C' stroke-width='2'%3E%3Crect x='30' y='30' width='60' height='60'/%3E%3Crect x='45' y='45' width='30' height='30'/%3E%3Cpath d='M60 15L75 30M60 105L75 90M15 60L30 45M105 60L90 45'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px'
          }}
        />
        <Header lang={lang} onLangChange={setLang} />
        <PatternBorder />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          lang={lang}
        />

        <DishGrid
          dishes={filteredDishes}
          categoryLabel={activeCategoryLabel}
          onOpen={handleOpen}
          lang={lang}
        />

        <AnimatePresence>
          {openItem && <DishDetailSheet dish={openItem} onClose={handleClose} lang={lang} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
