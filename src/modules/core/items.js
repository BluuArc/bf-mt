import { sphereTypeMapping } from '@/modules/constants';

export function getSphereCategory (item) {
  // can pass in number or item entry directly
  const type = typeof item === 'object' ? item['sphere type'] : item;
  return sphereTypeMapping[type || 0];
}

export function getItemType (item = {}) {
  const { type, raid } = item;
  // items, raid items, booster, spheres, materials, evo materials, ls spheres
  if (type === 'consumable' && !raid) {
    return 'Item';
  } else if (type === 'material' && !raid) {
    return 'Material';
  } else if (type === 'sphere') {
    return 'Sphere';
  } else if (type === 'evomat') {
    return 'Evo Material';
  } else if (type === 'summoner_consumable') {
    return 'Booster';
  } else if (raid) {
    return 'Raid Item';
  } else if (type === 'ls_sphere') {
    return 'LS Sphere';
  } else {
    return type || 'Unknown Type';
  }
}
