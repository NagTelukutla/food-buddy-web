export function getMobileNavLinkClass(isActive) {
  return `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/20'
      : 'text-stone-800 hover:bg-white/35 active:bg-white/50'
  }`;
}

export function getMobileNavInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
