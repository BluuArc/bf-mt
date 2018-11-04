import { missionMonsterGroupMapping as groupMapping } from '@/modules/constants';
import SWorker from '@/assets/sww.min.js';
import logger from '@/modules/Logger';

export function getMimicData (mission) {
  if (!(mission && mission.mimic_info && Object.keys(mission.mimic_info).length > 0)) {
    return [];
  }
  const { mimic_info: mimicInfo } = mission;

  return [
    {
      group: groupMapping[mimicInfo.group_1_monster_group],
      chance: +mimicInfo.group_1_chance,
    },
    {
      group: groupMapping[mimicInfo.group_2_monster_group],
      chance: +mimicInfo.group_2_chance,
    },
  ].filter(entry => !!entry.group && entry.chance > 0);
}

export async function getRelatedMissions (mission, pageDb, keys = Object.keys(pageDb)) {
  let result = {
    relatedKeys: [],
    type: 'None',
  };
  if (!mission) {
    return result;
  }

  try {
    result = await SWorker.run((keys, pageDb, currentMission) => {
      // search for related missions at increasing scope until a list is found
      const { land, area, dungeon } = currentMission;
      let type = 'Dungeon';
      let relatedKeys = keys.filter(k => pageDb[k] && pageDb[k].dungeon === dungeon && k !== currentMission.id.toString());
      if (relatedKeys.length === 0) {
        type = 'Area';
        relatedKeys = keys.filter(k => pageDb[k] && pageDb[k].area === area && k !== currentMission.id.toString());
      }
      if (relatedKeys.length === 0) {
        type = 'Land';
        relatedKeys = keys.filter(k => pageDb[k] && pageDb[k].land === land && k !== currentMission.id.toString());
      }
      return { relatedKeys, type };
    }, [keys, pageDb, mission]);
  } catch (err) {
    logger.error('error getting related missions', err);
  }
  return result;
}
