import { createContext, useContext, useEffect, useState } from 'react'
import type { ItemSelection } from '../lib/types'

const CART_KEY = 'sunnah-cafe-cart'
const CartContext = createContext(null)

function selectionKey(dishId: string, selections: ItemSelection[]) {
  return `${dishId}:${selections
    .map((selection) => `${selection.groupId}=${selection.optionId}`)
    .sort()
    .join('|')}`
}

function normalizeSelections(value: unknown): ItemSelection[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((selection) => (
    typeof selection?.groupId === 'string'
    && typeof selection?.optionId === 'string'
    && selection.groupLabel != null
    && selection.optionLabel != null
      ? [{
        ...selection,
        priceAdjustmentCents: Number.isInteger(selection.priceAdjustmentCents)
          ? selection.priceAdjustmentCents
          : 0,
      }]
      : []
  )) as ItemSelection[]
}

function loadCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value
      .filter((item) => typeof item?.dishId === 'string' && Number.isInteger(item?.quantity) && item.quantity > 0)
      .map((item) => {
        const selections = normalizeSelections(item.selections)
        return { ...item, selections, key: typeof item.key === 'string' ? item.key : selectionKey(item.dishId, selections) }
      })
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addItem(dishId, quantity = 1, selections: ItemSelection[] = []) {
    const key = selectionKey(dishId, selections)
    setItems((current) => {
      const existing = current.find((item) => item.key === key)
      if (!existing) return [...current, { key, dishId, quantity: Math.min(quantity, 99), selections }]
      return current.map((item) =>
        item.key === key
          ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
          : item,
      )
    })
  }

  function setQuantity(key, quantity) {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.key !== key))
      return
    }
    setItems((current) => current.map((item) =>
      item.key === key ? { ...item, quantity: Math.min(quantity, 99) } : item,
    ))
  }

  function removeItem(key) {
    setItems((current) => current.filter((item) => item.key !== key))
  }

  function clearCart() {
    setItems([])
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, addItem, setQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) throw new Error('useCart must be used inside CartProvider')
  return cart
}