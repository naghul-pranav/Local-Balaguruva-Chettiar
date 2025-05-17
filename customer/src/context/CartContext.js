import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [animateCart, setAnimateCart] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.email) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const cartRes = await axios.get(`https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productsRes = await axios.get('https://final-balaguruva-chettiar-ecommerce.onrender.com/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enrichedCart = cartRes.data.items
          .map(item => {
            const product = productsRes.data.find(p => String(p.id) === String(item.productId));
            if (!product) return null;
            return {
              id: item.productId,
              name: product.name,
              image: `data:image/jpeg;base64,${product.image}`,
              mrp: product.mrp,
              discountedPrice: product.discountedPrice,
              quantity: item.quantity,
            };
          })
          .filter(item => item !== null);
        setCart(enrichedCart);
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user?.email) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        return [
          ...prevCart,
          { id: product.id, name: product.name, image: `data:image/jpeg;base64,${product.image}`, mrp: product.mrp, discountedPrice: product.discountedPrice, quantity },
        ];
      });

      setAnimateCart(true);
      setTimeout(() => setAnimateCart(false), 500);

      await axios.post(
        'https://final-balaguruva-chettiar-ecommerce.onrender.com/api/cart',
        {
          userId: user.email,
          items: [
            ...cart.map(item => ({ productId: item.id, quantity: item.quantity })),
            { productId: product.id, quantity },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Error adding to cart:', err);
      setCart(prevCart => prevCart);
    }
  };

  return <CartContext.Provider value={{ cart, addToCart, animateCart, user, setUser }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);