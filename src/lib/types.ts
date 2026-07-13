// Domain types shared across the Zahiiba app.

export const LANGS = ['EN', 'FI', 'SO'] as const
export type Lang = (typeof LANGS)[number]

/** A string translated into every supported language. */
export type Localized = Record<Lang, string>

/** A list of strings translated into every supported language. */
export type LocalizedList = Record<Lang, string[]>

/** An allergen chip. `color` maps to a badge variant (wheat, dairy, shared…). */
export interface Allergen {
  label: Localized
  color: string
}

/** "Good to know" metadata shown in the dish detail sheet. */
export interface DishMeta {
  halal: boolean
  spice: Localized
  serves: Localized
}

/** A single menu dish. */
export interface Dish {
  id: string
  name: Localized
  subtitle: Localized
  description: Localized
  longDescription: Localized
  price: number
  /** Category slug, e.g. "food" (matches the static categories in i18n.js). */
  category: string
  image: string
  isPopular: boolean
  inStock: boolean
  ingredients: LocalizedList
  allergens: Allergen[]
  meta: DishMeta
  sortOrder?: number
  createdAt?: string
}

/** Payload shape accepted by createDish / updateDish (id optional). */
export type DishInput = Omit<Dish, 'id' | 'sortOrder' | 'createdAt'> &
  Partial<Pick<Dish, 'id'>>
