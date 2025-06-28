import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../utils/cartUtils';

const initialState = (() => {
  try {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : { cartItems: [], shippingAddress: {}, paymentMethod: 'COD' };
  } catch (error) {
    console.error('Failed to parse cart from localStorage', error);
    return { cartItems: [], shippingAddress: {}, paymentMethod: 'COD' };
  }
})();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      // Validate and ensure minimum quantity of 1
      const quantity = Math.max(Number(item.qty) || 1, 1);

      // Create complete cart item with all necessary fields
      const cartItem = {
        ...item, // Spread all original properties
        qty: quantity,
        productId: item._id,
        price: item.variant?.price || item.basePrice || item.price,
        countInStock: item.variant?.stock || item.countInStock || 0,
        variant: item.variant
          ? {
              size: item.variant.size,
              color: item.variant.color,
              price: item.variant.price,
              // sku: item.variant.sku,
              stock: item.variant.stock,
            }
          : undefined,
      };

      // Find existing item index
      const existIndex = state.cartItems.findIndex(
        (x) =>
          x._id === item._id &&
          ((!x.variant && !item.variant) ||
            (x.variant &&
              item.variant &&
              x.variant.size === item.variant.size &&
              x.variant.color === item.variant.color))
      );

      if (existIndex >= 0) {
        // Update existing item completely
        state.cartItems[existIndex] = cartItem;
      } else {
        // Add new item
        state.cartItems.push(cartItem);
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      const { productId, variantKey } = action.payload;

      state.cartItems = state.cartItems.filter((item) => {
        // If we're removing a variant item
        if (variantKey) {
          const [variantSize, variantColor] = variantKey.split('-');
          return !(
            item.productId === productId &&
            item.variant?.size === variantSize &&
            item.variant?.color === variantColor
          );
        }
        // If we're removing a non-variant item
        return item.productId !== productId || item.variant;
      });

      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      return updateCart(state);
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      return updateCart(state);
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      return updateCart(state);
    },
    resetCart: () => initialState,
    updateCartItemQty: (state, action) => {
      const { productId, variantKey, qty } = action.payload;
      const newQty = Math.max(Number(qty), 1);

      state.cartItems = state.cartItems.map((item) => {
        if (variantKey) {
          const [size, color] = variantKey.split('-');
          if (
            item.productId === productId &&
            item.variant?.size === size &&
            item.variant?.color === color
          ) {
            return { ...item, qty: Math.min(newQty, item.countInStock) };
          }
        } else if (item.productId === productId && !item.variant) {
          return { ...item, qty: Math.min(newQty, item.countInStock) };
        }
        return item;
      });

      return updateCart(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
  resetCart,
  updateCartItemQty,
} = cartSlice.actions;

export default cartSlice.reducer;
