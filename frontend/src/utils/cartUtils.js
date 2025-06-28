export const updateCart = (state) => {
  // Calculate items price with discount
  // Round all prices to 2 decimal places
  const itemsPrice = parseFloat(
    state.cartItems
      .reduce((acc, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        const discount = Math.min(Math.max(Number(item.discount) || 0, 0), 100);
        return acc + price * qty * (1 - discount / 100);
      }, 0)
      .toFixed(2)
  );

  // Shipping price (free over 1000)
  const shippingPrice = itemsPrice > 1000 ? 0 : 10;

  // Tax calculation (18%)
  const taxPrice = itemsPrice * 0.18;

  // Total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Discount amount
  const discountAmount = state.cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Math.min(Math.max(Number(item.discount) || 0, 0), 100);
    return acc + price * qty * (discount / 100);
  }, 0);

  // Update state
  state.itemsPrice = itemsPrice;
  state.shippingPrice = shippingPrice;
  state.taxPrice = taxPrice;
  state.totalPrice = totalPrice;
  state.discountAmount = discountAmount;

  localStorage.setItem('cart', JSON.stringify(state));
  return state;
};
