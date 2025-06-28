// utils/formatUtils.js
export const safeToFixed = (value, decimals = 2) => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};
