import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isLoggedIn, logout, fetchAllCategories, fetchAllDishes, reorderDishes } from '../hooks/useAdmin'
import LoginForm from '../components/admin/LoginForm'
import AdminHeader from '../components/admin/AdminHeader'
import AdminDishCard from '../components/admin/AdminDishCard'
import DishForm from '../components/admin/DishForm'
import CategoryManager from '../components/admin/CategoryManager'
import StaffOrderQueue from '../components/admin/StaffOrderQueue'
import OrderHistory from '../components/admin/OrderHistory'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Plus, Search, Tags, UtensilsCrossed, CheckCircle2, XCircle, ListOrdered, History, ArrowDownAZ } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { AdminLangProvider, useAdminLang } from '../lib/adminLang'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-brand-text-muted">{label}</p>
        <p className="font-display text-2xl font-bold text-brand-dark leading-none">{value}</p>
      </div>
    </div>
  )
}

function SortableDishCard({ dish, categories, onEdit, onDeleted, onUpdated, sortable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id, disabled: !sortable })

  return (
    <AdminDishCard
      dish={dish}
      categories={categories}
      onEdit={onEdit}
      onDeleted={onDeleted}
      onUpdated={onUpdated}
      sortable={sortable}
      sortRef={setNodeRef}
      sortStyle={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition,
        willChange: 'transform',
      }}
      sortAttributes={attributes}
      sortListeners={listeners}
      isDragging={isDragging}
    />
  )
}

// ── Main admin page ───────────────────────────────────────────────────────────
function AdminPageInner() {
  const { t, lang } = useAdminLang()
  const [authed, setAuthed]         = useState(isLoggedIn())
  const [dishes, setDishes]         = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')
  const [filterCat, setFilterCat]   = useState('all')
  const [filterStock, setFilterStock] = useState('all') // 'all' | 'in' | 'out'
  const [sortBy, setSortBy]           = useState('manual')
  const [formOpen, setFormOpen]     = useState(false)
  const [editDish, setEditDish]     = useState(null)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [view, setView] = useState('orders')
  const [activeDishId, setActiveDishId] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const loadMenu = useCallback(async () => {
    setLoading(true)
    try {
      const [dishData, categoryData] = await Promise.all([fetchAllDishes(), fetchAllCategories()])
      setDishes(dishData)
      setCategories(categoryData)
    } catch {
      // If token expired, force re-login
      setAuthed(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) loadMenu()
  }, [authed, loadMenu])

  function handleLogin() {
    setAuthed(true)
  }

  function handleLogout() {
    logout()
    setAuthed(false)
    setDishes([])
    setCategories([])
  }

  function handleUpdated(updated) {
    setDishes(prev => prev.map(d => d.id === updated.id ? updated : d))
  }

  function handleDeleted(id) {
    setDishes(prev => prev.filter(d => d.id !== id))
  }

  function handleSaved(saved) {
    setDishes(prev => {
      const exists = prev.some(d => d.id === saved.id)
      return exists ? prev.map(d => d.id === saved.id ? saved : d) : [saved, ...prev]
    })
  }

  function openAdd() {
    if (categories.length === 0) {
      setCategoriesOpen(true)
      return
    }
    setEditDish(null)
    setFormOpen(true)
  }

  function openEdit(dish) {
    setEditDish(dish)
    setFormOpen(true)
  }

  function handleCategoryChanged(category, wasUpdated, wasDeleted) {
    setCategories((previous) => {
      if (wasDeleted) return previous.filter((item) => item.id !== category.id)
      if (wasUpdated) return previous.map((item) => item.id === category.id ? category : item)
      return [...previous, category]
    })
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const inStock  = dishes.filter(d => d.inStock).length
  const outStock = dishes.filter(d => !d.inStock).length

  // ── Filter + search ───────────────────────────────────────────────────────
  const visible = dishes.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.EN.toLowerCase().includes(q) || d.category.includes(q)
    const matchCat    = filterCat === 'all' || d.category === filterCat
    const matchStock  = filterStock === 'all'
      || (filterStock === 'in'  && d.inStock)
      || (filterStock === 'out' && !d.inStock)
    return matchSearch && matchCat && matchStock
  })
  const categoryOrder = new Map(categories.map((category, index) => [category.id, index]))
  const sortedVisible = [...visible].sort((left, right) => {
    if (filterCat === 'all') {
      const categoryDifference = (categoryOrder.get(left.category) ?? Number.MAX_SAFE_INTEGER)
        - (categoryOrder.get(right.category) ?? Number.MAX_SAFE_INTEGER)
      if (categoryDifference !== 0) return categoryDifference
    }
    if (sortBy === 'name') return left.name[lang].localeCompare(right.name[lang], lang)
    if (sortBy === 'price-low') return left.price - right.price
    if (sortBy === 'price-high') return right.price - left.price
    return left.sortOrder - right.sortOrder || left.name.EN.localeCompare(right.name.EN)
  })
  const canDrag = sortBy === 'manual' && filterCat !== 'all' && !search && filterStock === 'all'
  const activeDish = dishes.find((dish) => dish.id === activeDishId)

  async function handleDragEnd({ active, over }) {
    if (!canDrag || !over || active.id === over.id) {
      setActiveDishId(null)
      return
    }
    const reordered = [...sortedVisible]
    const sourceIndex = reordered.findIndex((dish) => dish.id === active.id)
    const targetIndex = reordered.findIndex((dish) => dish.id === over.id)
    if (sourceIndex < 0 || targetIndex < 0) {
      setActiveDishId(null)
      return
    }

    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderedIds = reordered.map((dish) => dish.id)
    const previous = dishes
    setDishes((current) => current.map((dish) => {
      const sortOrder = orderedIds.indexOf(dish.id)
      return dish.category === filterCat && sortOrder >= 0 ? { ...dish, sortOrder } : dish
    }))
    try {
      await reorderDishes(filterCat, orderedIds)
    } catch (error) {
      setDishes(previous)
      toast.error(error instanceof Error ? error.message : 'Järjestyksen tallennus epäonnistui')
    } finally {
      setActiveDishId(null)
    }
  }

  if (!authed) {
    return (
      <>
        <Toaster richColors position="top-center" />
        <LoginForm onLogin={handleLogin} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Toaster richColors position="top-right" />
      <AdminHeader dishCount={dishes.length} onLogout={handleLogout} />

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard icon={UtensilsCrossed} label={t.totalDishes} value={dishes.length} color="bg-brand-gold/20 text-brand-gold" />
          <StatCard icon={CheckCircle2}    label={t.inStock}     value={inStock}       color="bg-halal-bg text-halal" />
          <StatCard icon={XCircle}         label={t.outOfStock}  value={outStock}       color="bg-tag-bg-red text-tag-text-red" />
        </div>

        <div className="mt-6 inline-flex rounded-lg border border-brand-border bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setView('orders')}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold ${view === 'orders' ? 'bg-brand-gold text-brand-text-dark shadow-sm' : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text-dark'}`}
          >
            <ListOrdered className="h-4 w-4" /> {t.ordersTab}
          </button>
          <button
            type="button"
            onClick={() => setView('menu')}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold ${view === 'menu' ? 'bg-brand-gold text-brand-text-dark shadow-sm' : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text-dark'}`}
          >
            <UtensilsCrossed className="h-4 w-4" /> {t.menuTab}
          </button>
          <button
            type="button"
            onClick={() => setView('history')}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-bold ${view === 'history' ? 'bg-brand-gold text-brand-text-dark shadow-sm' : 'text-brand-text-muted hover:bg-brand-bg hover:text-brand-text-dark'}`}
          >
            <History className="h-4 w-4" /> {lang === 'FI' ? 'Historia' : 'History'}
          </button>
        </div>

        {view === 'orders' && <StaffOrderQueue />}

        {view === 'history' && <OrderHistory />}

        {view === 'menu' && <>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.searchDishes}
                className="pl-9"
              />
            </div>

            {/* Category filter */}
            <select
              className="h-10 rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
            >
              <option value="all">{t.allCategories}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label[lang]}</option>)}
            </select>

            {/* Stock filter */}
            <select
              className="h-10 rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={filterStock}
              onChange={e => setFilterStock(e.target.value)}
            >
              <option value="all">{t.allStock}</option>
              <option value="in">{t.stockIn}</option>
              <option value="out">{t.stockOut}</option>
            </select>

            <div className="relative">
              <ArrowDownAZ className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
              <select
                className="h-10 rounded-xl border border-brand-border bg-white py-0 pl-9 pr-3 text-sm text-brand-text-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label={lang === 'FI' ? 'Järjestä tuotteet' : 'Sort dishes'}
              >
                <option value="manual">{lang === 'FI' ? 'Oma järjestys' : 'Manual order'}</option>
                <option value="name">{lang === 'FI' ? 'Nimi A-Ö' : 'Name A-Z'}</option>
                <option value="price-low">{lang === 'FI' ? 'Hinta: pieni suuri' : 'Price: low to high'}</option>
                <option value="price-high">{lang === 'FI' ? 'Hinta: suuri pieni' : 'Price: high to low'}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button onClick={() => setCategoriesOpen(true)} variant="outline" size="icon" title={t.manageCategories}>
              <Tags className="h-4 w-4" />
            </Button>
            <Button onClick={openAdd} variant="brand" className="gap-2">
              <Plus className="h-4 w-4" /> {t.addNewDish}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 flex flex-col items-center gap-3 text-brand-text-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-brand-gold" />
            <p className="text-sm">{t.loadingDishes}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && sortedVisible.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center text-brand-text-muted">
            <UtensilsCrossed className="h-12 w-12 opacity-30" />
            <p className="font-display text-lg font-bold text-brand-dark">{t.noDishesFound}</p>
            <p className="text-sm">{search || filterCat !== 'all' ? t.tryChangingFilters : t.addFirstDish}</p>
          </div>
        )}

        {/* Dish grid */}
        {!loading && sortedVisible.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveDishId(active.id)}
            onDragCancel={() => setActiveDishId(null)}
            onDragEnd={(event) => void handleDragEnd(event)}
          >
            <SortableContext items={sortedVisible.map((dish) => dish.id)} strategy={rectSortingStrategy}>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
                {sortedVisible.map(dish => (
                  <SortableDishCard
                    key={dish.id}
                    dish={dish}
                    categories={categories}
                    onEdit={openEdit}
                    onDeleted={handleDeleted}
                    onUpdated={handleUpdated}
                    sortable={canDrag}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeDish && (
                <div className="w-52 rounded-lg border border-brand-gold bg-white px-3 py-2 shadow-xl">
                  <p className="line-clamp-1 text-sm font-bold text-brand-dark">
                    {activeDish.name[lang] || activeDish.name.EN}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-brand-text-muted">
                    {activeDish.subtitle[lang] || activeDish.subtitle.EN}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
        </>}
      </div>

      {/* Add / Edit form */}
      <DishForm
        key={editDish?.id ?? 'new'}
        dish={editDish}
        categories={categories}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditDish(null) }}
        onSaved={handleSaved}
      />
      <CategoryManager
        categories={categories}
        dishes={dishes}
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        onChanged={handleCategoryChanged}
      />
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminLangProvider>
      <AdminPageInner />
    </AdminLangProvider>
  )
}
