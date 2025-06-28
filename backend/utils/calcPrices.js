function addDecimals(num) {
  return parseFloat((Math.round(num * 100) / 100).toFixed(2));
}

export function calcPrices(orderItems) {
  // Validate orderItems
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return {
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: 0,
      discountAmount: 0,
    };
  }

  // Calculate items price with proper number validation
  const itemsPrice = orderItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Math.min(Math.max(Number(item.discount) || 0, 0), 100); // Ensure discount is between 0-100

    const discountedPrice = price - (price * discount) / 100;
    return acc + discountedPrice * qty;
  }, 0);

  // Calculate shipping price (free over $100)
  const shippingPrice = itemsPrice > 100 ? 0 : 10;

  // Calculate tax with tiered rates
  const gstRate = itemsPrice <= 1000 ? 5 : 12;
  const taxPrice = (itemsPrice * gstRate) / 100;

  // Calculate total discount amount
  const discountAmount = orderItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const discount = Math.min(Math.max(Number(item.discount) || 0, 0), 100);
    return acc + price * (discount / 100) * qty;
  }, 0);

  // Calculate total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Return all values as numbers (not strings)
  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
    discountAmount: addDecimals(discountAmount),
  };
}
