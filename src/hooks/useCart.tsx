import { createContext, useContext, useEffect, useState } from 'react'

const CART_KEY = 'sunnah-cafe-cart'
const CartContext = createContext(null)

function loadCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value.filter(
      (item) => typeof item?.dishId === 'string' && Number.isInteger(item?.quantity) && item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  function addItem(dishId, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => item.dishId === dishId)
      if (!existing) return [...current, { dishId, quantity: Math.min(quantity, 99) }]
      return current.map((item) =>
        item.dishId === dishId
          ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
          : item,
      )
    })
  }

  function setQuantity(dishId, quantity) {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.dishId !== dishId))
      return
    }
    setItems((current) => current.map((item) =>
      item.dishId === dishId ? { ...item, quantity: Math.min(quantity, 99) } : item,
    ))
  }

  function removeItem(dishId) {
    setItems((current) => current.filter((item) => item.dishId !== dishId))
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