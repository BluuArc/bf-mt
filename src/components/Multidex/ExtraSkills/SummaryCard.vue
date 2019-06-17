<template>
  <base-summary-card
    :entry="skill"
    :buffSources="buffSources"
    :getEffectsFromSource="getEffectsFromSource"
    :getTextForSource="getTextForSource"
  >
    <span slot="allentrypreview">
      <!-- show nothing, as there's only one source -->
    </span>
    <span slot="value-header" slot-scope="{ entry }">
      {{ getHeaderTextForSource(entry) }}
    </span>
  </base-summary-card>
</template>

<script>
import { getEffectsListForExtraSkill } from '@/modules/core/extra-skills';
import BaseSummaryCard from '@/components/Multidex/BaseSummaryCard';

export default {
  props: {
    skill: {
      type: Object,
      required: true,
    },
  },
  components: {
    BaseSummaryCard,
  },
  computed: {
    buffSources () {
      return [{ skill: this.skill }];
    },
  },
  methods: {
    getEffectsFromSource ({ skill } = {}, target, effectType) {
      return getEffectsListForExtraSkill({
        skill,
        target,
        effectType,
      });
    },
    getHeaderTextForSource ({ skill } = {}) {
      return skill.name || skill.id;
    },
    getTextForSource (sourcePath, source, initialValue) {
      let result;
      if (sourcePath === 'es' && this.skill) {
        const name = (this.skill && this.skill.name) || source.id;
        result = `Extra Skill: ${name}`;
      }
      return result || initialValue || sourcePath;
    },
  },
};
</script>
