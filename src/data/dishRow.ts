import type { Dish, DishInput } from '../lib/types'

/** A dish row as stored in Supabase (snake_case columns). */
export interface DishRow {
  id: string
  name: Dish['name']
  subtitle: Dish['subtitle']
  description: Dish['description']
  long_description: Dish['longDescription']
  price: number | string
  category: string
  image_url: string | null
  is_popular: boolean
  in_stock: boolean
  ingredients: Dish['ingredients']
  allergens: Dish['allergens']
  meta: Dish['meta']
  sort_order: number | null
  created_at?: string
}

export function rowToDish(row: DishRow): Dish {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    description: row.description,
    longDescription: row.long_description,
    price: typeof row.price === 'string' ? Number(row.price) : row.price,
    category: row.category,
    image: row.image_url ?? '',
    isPopular: row.is_popular,
    inStock: row.in_stock,
    ingredients: row.ingredients,
    allergens: row.allergens ?? [],
    meta: row.meta,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  }
}

/** Map a dish (or partial input) to the snake_case columns for upsert/update. */
export function dishToRow(dish: Dish | (DishInput & { id: string })): DishRow {
  return {
    id: dish.id,
    name: dish.name,
    subtitle: dish.subtitle,
    description: dish.description,
    long_description: dish.longDescription,
    price: dish.price,
    category: dish.category,
    image_url: dish.image || '',
    is_popular: dish.isPopular,
    in_stock: dish.inStock,
    ingredients: dish.ingredients,
    allergens: dish.allergens,
    meta: dish.meta,
    sort_order: 'sortOrder' in dish && dish.sortOrder != null ? dish.sortOrder : 0,
  }
}
