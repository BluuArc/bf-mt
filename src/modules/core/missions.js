import { missionMonsterGroupMapping as groupMapping } from '@/modules/constants';

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
