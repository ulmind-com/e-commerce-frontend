import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 text-primary-600 hover:text-primary-700 font-medium">Continue Shopping</button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <img src={item.image_urls[0]} alt={item.title} className="h-full w-full object-cover object-center" />
                  ) : (
                    <div className="h-full w-full bg-gray-200"></div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3 className="line-clamp-2"><a href="#">{item.title}</a></h3>
                      <p className="ml-4">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-200 rounded">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 px-2 text-gray-600 hover:bg-gray-100"><FiMinus /></button>
                      <span className="px-2 font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 px-2 text-gray-600 hover:bg-gray-100"><FiPlus /></button>
                    </div>

                    <div className="flex">
                      <button type="button" onClick={() => removeFromCart(item._id)} className="font-medium text-red-500 hover:text-red-400 p-2">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>₹{getCartTotal().toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
            <div className="mt-6">
              <button
                onClick={handleCheckout}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
