// Domain types shared across the Sunnah Cafe app.

export const LANGS = ['EN', 'FI'] as const
export type Lang = (typeof LANGS)[number]

/** A string translated into every supported language. */
export type Localized = Record<Lang, string>

/** A list of strings translated into every supported language. */
export type LocalizedList = Record<Lang, string[]>

/** A menu category, ordered as it should appear in customer navigation. */
export interface Category {
  id: string
  label: Localized
  sortOrder: number
}

/** An allergen chip. `color` maps to a badge variant (wheat, dairy, shared…). */
export interface Allergen {
  label: Localized
  color: string
}

/** "Good to know" metadata shown in the dish detail sheet. */
export interface DishMeta {
  halal: boolean
  spice: Localized | null
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

export const FULFILLMENT_LOCATIONS = [
  'counter_pickup',
  'womens_prayer_hall_door',
  'womens_cafe_hall',
  'mens_cafe_hall',
] as const
export type FulfillmentLocation = (typeof FULFILLMENT_LOCATIONS)[number]

export const PAYMENT_METHODS = [
  'sumup_online',
  'card_on_fulfillment',
  'cash_on_fulfillment',
] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const ORDER_STATUSES = [
  'awaiting_payment',
  'awaiting_staff_approval',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
  'expired',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_STATUSES = [
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded',
] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const ORDERING_MODES = ['closed', 'approval_required'] as const
export type OrderingMode = (typeof ORDERING_MODES)[number]

export interface CartItem {
  dishId: string
  quantity: number
}

export interface OrderItemSnapshot {
  dishId: string
  name: Localized
  unitPriceCents: number
  quantity: number
  lineTotalCents: number
}

export interface Order {
  id: string
  orderNumber: number
  ticketDate: string
  ticketNumber: number
  customerFirstName: string
  fulfillmentLocation: FulfillmentLocation
  customerNote: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  totalCents: number
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  items: OrderItemSnapshot[]
}
