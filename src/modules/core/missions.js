export function getMimicData (mission) {
  if (!(mission && mission.mimic_info && Object.keys(mission.mimic_info).length > 0)) {
    return [];
  }

  const mimicIds = {
    mimic: '60142',
    batMimic: '60143',
    dragonMimic: '60144',
    metalMimic: '60224',
  };
  const groupMapping = {
    '1000': mimicIds.mimic,
    '1100': mimicIds.batMimic,
    '1101': mimicIds.batMimic,
    '1200': mimicIds.dragonMimic,
    '1300': mimicIds.metalMimic,
  };
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
