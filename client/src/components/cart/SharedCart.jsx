// client/src/components/cart/SharedCart.jsx
import React from 'react';
import { useCart } from './CartContext';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSocket } from '../socket/SocketContext';

const SharedCart = () => {
  const { cart, cartManager } = useCart();
  const { socket } = useSocket();

  const handleCheckout = async () => {
    try {
      const checkout = await cartManager.checkout();
      window.location.href = checkout.webUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    cartManager.updateQuantity(productId, quantity);
    // Broadcast cart update to other participants
    socket.emit('cart_updated', { cart: cartManager.cart });
  };

  const handleRemoveItem = (productId) => {
    cartManager.removeItem(productId);
    // Broadcast cart update to other participants
    socket.emit('cart_updated', { cart: cartManager.cart });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-xl font-bold">Shopping Cart</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">${item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                  className="w-16 p-1 border rounded"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-lg font-bold">
          Total: ${cart.total.toFixed(2)}
        </div>
        <Button
          onClick={handleCheckout}
          disabled={cart.items.length === 0}
        >
          Checkout
        </Button>
      </CardFooter>
    </Card>
  );
};