import { sphereTypeMapping } from '@/modules/constants';

export function getSphereCategory (item) {
  // can pass in number or item entry directly
  const type = typeof item === 'object' ? item['sphere type'] : item;
  return sphereTypeMapping[type || 0];
}
