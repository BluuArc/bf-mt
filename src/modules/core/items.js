import { sphereTypeMapping } from '@/modules/constants';
import SWorker from '@/assets/sww.min';
import cloneDeep from 'lodash/cloneDeep';

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

// given current items/karma, return "shopping list" of items/karma needed
export async function getItemShoppingList (item, pageDb, currentlyHave = {}) {
  // result contains number of base materials total needed (given currentlyHave)
  const result = await getBaseMaterialsOfItem(item, pageDb);
  const totals = cloneDeep(result);

  // craftables contains number of craftable items total needed (given currentlyHave)
  const craftables = await getCraftablesInRecipeOfItem(item, pageDb);
  const totalCraftables = cloneDeep(craftables);

  // key = item id or karma, value = count
  const { karma, ...myMaterials} = currentlyHave;

  // get difference from current karma
  if (!isNaN(karma)) {
    result.karma = Math.max(0, result.karma - karma);
  }

  // for every item we currently have
  for (const materialId in myMaterials) {
    const currentItem = pageDb[materialId];
    const count = myMaterials[materialId];

    if (currentItem.recipe) {
      // subtract base recipe items
      const baseRecipe = await getBaseMaterialsOfItem(currentItem, pageDb);
      result.karma = Math.max(0, result.karma - (count * baseRecipe.karma));
      Object.keys(baseRecipe.materials).forEach(subMaterialId => {
        const subCount = baseRecipe.materials[subMaterialId];
        result.materials[subMaterialId] = Math.max(0, result.materials[subMaterialId] - (count * subCount));

        if (currentlyHave[subMaterialId] !== undefined) {
          currentlyHave[subMaterialId] = Math.max(0, currentlyHave[subMaterialId] - (count * subCount));
        }
      });
      result.karma = Math.max(0, result.karma - (count * +currentItem.recipe.karma));

      // subtract craftable items
      const materialCraftables = await getCraftablesInRecipeOfItem(currentItem, pageDb);
      convertMaterialsObjectToArray(materialCraftables).forEach(({ id, count: craftableCount }) => {
        if (craftables[id] !== undefined) {
          craftables[id] = Math.max(0, craftables[id] - (count * craftableCount));
        }

        if (currentlyHave[id] !== undefined) {
          currentlyHave[id] = Math.max(0, currentlyHave[id] - (count * craftableCount));
        }
      });
    } else if (result.materials[materialId] !== undefined) {
      // subtract base material count
      result.materials[materialId] = Math.max(0, result.materials[materialId] - count);
    }
  }

  return {
    baseMaterialsNeeded: convertMaterialsObjectToArray(result.materials)
      .map(entry => ({ total: totals.materials[entry.id], ...entry })),
    totalKarmaNeeded: result.karma,
    allCraftables: convertMaterialsObjectToArray(craftables)
      .map(entry => ({ total: totalCraftables[entry.id], ...entry })),
    currentlyHave
  };
}

export async function getBaseMaterialsOfItem (item = {}, pageDb = {}) {
  return SWorker.run((item, pageDb) => {
    const getBaseMaterialsOf = (item) => {
      const result = {
        // key = item id, value = count needed
        materials: {},
        karma: 0,
      };

      if (!item.recipe) {
        return result;
      }

      result.karma += +item.recipe.karma;
      item.recipe.materials.forEach(material => {
        const currentItem = pageDb[material.id.toString()];
        const currentItemId = currentItem.id.toString();
        const count = +material.count;
        if (currentItem.recipe) {
          // get base materials of current material
          const materialRecipe = getBaseMaterialsOf(currentItem);
          Object.keys(materialRecipe.materials).forEach(baseMaterialId => {
            if (isNaN(result.materials[baseMaterialId])) {
              result.materials[baseMaterialId] = 0;
            }

            // add count based on amount needed
            result.karma += (count * +currentItem.recipe.karma);
            result.materials[baseMaterialId] += (count * materialRecipe.materials[baseMaterialId]);
          });
        } else { // found a base material
          if (!result.materials[currentItemId]) {
            result.materials[currentItemId] = 0;
          }
          result.materials[currentItemId] += count;
        }
      });
      return result;
    };
    return getBaseMaterialsOf(item);
  }, [item, pageDb]);
}

export async function getCraftablesInRecipeOfItem (item = {}, pageDb = {}) {
  return SWorker.run((item, pageDb) => {
    const currentCraftables = {};
    const getCraftablesInRecipeOf = (item) => {
      if (item.recipe) {
        item.recipe.materials.forEach(material => {
          const currentItem = pageDb[material.id.toString()];
          const currentItemId = currentItem.id.toString();
          if (currentItem.recipe) {
            if (!currentCraftables[currentItemId]) {
              currentCraftables[currentItemId] = 0;
            }
            currentCraftables[currentItemId] += +material.count;
            getCraftablesInRecipeOf(currentItem);
          }
        });
      }
      return currentCraftables;
    };
    return getCraftablesInRecipeOf(item);
  }, [item, pageDb]);
}

export function convertMaterialsObjectToArray (input) {
  return Object.entries(input).map(([id, count]) => ({ count, id }));
}
