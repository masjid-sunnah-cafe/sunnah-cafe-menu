import { useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig, AnimatePresence } from 'framer-motion'
import { UI, getDishesText, getL10n, getL10nArray } from '../data/i18n'
import { useDishes } from '../hooks/useDishes'
import Header from '../components/Header'
import StickyBar from '../components/StickyBar'
import DishGrid from '../components/DishGrid'
import DishDetailSheet from '../components/DishDetailSheet'
import { getOrderingMode } from '../data/orderingRepository'

const LANG_KEY = 'sunnah-cafe-lang'
const ALL_CATEGORY = { id: 'all', label: { EN: 'All', FI: 'Kaikki' } }

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
      <div className="p-2.5 pb-0">
        <div className="aspect-[4/3] rounded-xl bg-brand-border/50 animate-pulse" />
      </div>
      <div className="px-3 pb-3 pt-2.5 space-y-2">
        <div className="h-4 w-2/3 rounded bg-brand-border/50 animate-pulse" />
        <div className="h-3 w-full rounded bg-brand-border/50 animate-pulse" />
        <div className="h-3 w-1/3 rounded bg-brand-border/50 animate-pulse" />
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(LANG_KEY)
    return saved === 'EN' || saved === 'FI' ? saved : 'FI'
  })
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery]                   = useState('')
  const [openItemId, setOpenItemId]         = useState(null)
  const openerRef = useRef(null)
  const [orderingMode, setOrderingMode] = useState('approval_required')

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang)
    document.documentElement.lang = lang.toLowerCase()
  }, [lang])

  useEffect(() => {
    void getOrderingMode().then(setOrderingMode).catch(() => {})
  }, [])

  const { dishes, categories, loading, error } = useDishes()

  // "All" first, then the real categories.
  const tabCategories = useMemo(() => [ALL_CATEGORY, ...categories], [categories])

  useEffect(() => {
    if (activeCategory !== 'all' && !categories.some((category) => category.id === activeCategory)) {
      setActiveCategory('all')
    }
  }, [activeCategory, categories])

  const searching = query.trim().length > 0

  const filteredDishes = useMemo(() => {
    const q = query.trim().toLowerCase()
    const categoryOrder = new Map(categories.map((category) => [category.id, category.sortOrder]))
    return dishes.filter((d) => {
      // When searching, look across every category; otherwise respect the tab.
      if (!q && activeCategory !== 'all' && d.category !== activeCategory) return false
      if (!q) return true
      const haystack = [
        getL10n(d.name, lang),
        getL10n(d.subtitle, lang),
        getL10n(d.description, lang),
        ...getL10nArray(d.ingredients, lang),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    }).sort((left, right) => {
      const categoryDifference = (categoryOrder.get(left.category) ?? Number.MAX_SAFE_INTEGER)
        - (categoryOrder.get(right.category) ?? Number.MAX_SAFE_INTEGER)
      if (categoryDifference !== 0) return categoryDifference
      return (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    })
  }, [dishes, categories, activeCategory, query, lang])

  const activeCategoryLabel = useMemo(
    () =>
      searching
        ? UI.searchResults[lang]
        : tabCategories.find((c) => c.id === activeCategory)?.label[lang] || '',
    [searching, tabCategories, activeCategory, lang],
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
            backgroundSize: '120px 120px',
          }}
        />

        <Header lang={lang} onLangChange={setLang} />

        {orderingMode === 'closed' && (
          <p role="status" className="relative z-10 mx-auto max-w-5xl px-4 pt-5 text-center text-sm font-bold text-brand-red md:px-6">
            {UI.orderingClosed[lang]}
          </p>
        )}

        <StickyBar
          lang={lang}
          query={query}
          onQuery={setQuery}
          categories={tabCategories}
          activeCategory={activeCategory}
          onCategory={(id) => {
            setActiveCategory(id)
            setQuery('')
          }}
        />

        {/* Loading state */}
        {loading && (
          <main className="mx-auto max-w-5xl px-4 pb-8 md:px-6 lg:px-8">
            <div className="mb-6 h-8 w-40 rounded-xl bg-brand-border/50 animate-pulse" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </main>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-display text-2xl font-bold text-brand-red">⚠️ {UI.error[lang]}</p>
            <p className="mt-2 text-sm text-brand-text-muted">{error}</p>
          </div>
        )}

        {/* Dish grid */}
        {!loading && !error && (
          <DishGrid
            dishes={filteredDishes}
            categoryLabel={activeCategoryLabel}
            onOpen={handleOpen}
            lang={lang}
            noResults={searching}
          />
        )}

        <DishDetailSheet dish={openItem} onClose={handleClose} lang={lang} />
      </div>
    </MotionConfig>
  )
}
