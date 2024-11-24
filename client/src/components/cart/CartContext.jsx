// client/src/components/cart/CartContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { cartManager } from '../../services/cart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(cartManager.cart);

  useEffect(() => {
    return cartManager.addListener(setCart);
  }, []);

  return (
    <CartContext.Provider value={{ cart, cartManager }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);