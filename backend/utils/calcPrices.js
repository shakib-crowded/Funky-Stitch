function addDecimals(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

export function calcPrices(orderItems) {
  // Step 1: Calculate discounted items price
  const itemsPrice = orderItems.reduce((acc, item) => {
    const discount = item.discount || 0; // if no discount, default to 0
    const discountedPrice = item.price - (item.price * discount) / 100;
    return acc + discountedPrice * item.qty;
  }, 0);

  // Step 2: Shipping price
  const shippingPrice = itemsPrice > 100 ? 0 : 10;

  // Step 3: Tax based on final discounted item price
  const gstRate = itemsPrice <= 1000 ? 5 : 12;
  const taxPrice = (itemsPrice * gstRate) / 100;

  // Step 4: Total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Step 5: Return all values as strings
  return {
    itemsPrice: addDecimals(itemsPrice),
    shippingPrice: addDecimals(shippingPrice),
    taxPrice: addDecimals(taxPrice),
    totalPrice: addDecimals(totalPrice),
  };
}
