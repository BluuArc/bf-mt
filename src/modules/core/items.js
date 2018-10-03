import { sphereTypeMapping } from '@/modules/constants';
import SWorker from '@/assets/sww.min';

export function getSphereCategory (item) {
  // can pass in number or item entry directly
  const type = typeof item === 'object' ? item['sphere type'] : item;
  return sphereTypeMapping[type || 0];
}

export function isSphere (item) {
  return item && (item['sphere type'] !== undefined || item.type === 'sphere' || item.type === 'ls_sphere');
}

export function getItemType (item) {
  if (!item) {
    return 'None';
  }

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

export function getItemEffects (item = {}) {
  if (!item || !item.effect) {
    return [];
  }

  if (item.effect.effect && item.effect.effect.length > 0) {
    const { effect, ...extraParams } = item.effect;
    return [
      { ...effect[0], ...extraParams },
      ...effect.slice(1),
    ];
  } else {
    return item.effect;
  }
}

export function getFullUsageList (item, pageDb = {}) {
  return SWorker.run((item, pageDb) => {
    const currentUsageTracker = {};
    const getUsageList = (entry) => {
      if (entry && entry.usage) {
        entry.usage.forEach(usageEntry => {
          currentUsageTracker[usageEntry.id] = true;
          getUsageList(pageDb[usageEntry.id]);
        });
      }
    };
    getUsageList(item);
    return Object.keys(currentUsageTracker);
  }, [item, pageDb]);
}
