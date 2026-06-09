export function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?[0-9]{10,15}$/.test(cleaned);
}

export function phoneSuffix(phone = '') {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function phonesMatch(phoneA, phoneB) {
  const a = phoneSuffix(phoneA);
  const b = phoneSuffix(phoneB);
  return a.length >= 10 && a === b;
}

export function formatPhoneDisplay(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export function filterOrdersByPhone(orders = [], profilePhone = '') {
  if (!profilePhone) return orders;
  return orders.filter((order) => phonesMatch(order.phone, profilePhone));
}
