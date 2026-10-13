export function formatAFN(n) {
  return 'AFN ' + Number(n || 0).toLocaleString('en-US');
}

export const PROPERTY_TYPES = ['house', 'apartment', 'land', 'shop', 'commercial'];
export const PROPERTY_STATUSES = ['sale', 'rent'];
