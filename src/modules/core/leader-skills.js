import { getEffectsList } from './buffs';
import { targetTypes, squadBuffTypes } from '@/modules/constants';

export function getLeaderSkillEffects (skill = {}) {
  return skill && Array.isArray(skill.effects) ?
    Array.from(skill.effects) :
    [];
}

export function getEffectsListForLeaderSkill ({
  skill = {},
  target = targetTypes.PARTY,
  effectType = squadBuffTypes.PROC,
}) {
  const effects = getLeaderSkillEffects(skill)
    .map(e => ({ ...e, sourcePath: `Leader Skill: ${skill.name || '(No name found)'} (${skill.id})`}));
  return getEffectsList({
    leaderSkillEffects: effects,
    target,
    effectType,
  });
}
