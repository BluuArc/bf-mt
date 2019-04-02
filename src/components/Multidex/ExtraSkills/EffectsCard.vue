<template>
  <description-card-base
    :entry="skill"
    materialColor="purple lighten-1"
    :titleHtmlGenerator="() => 'Effects'"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => effects"
    :tabNames="['Unified', conditionalEffects.length > 0 && 'Split By Condition', 'Buff List'].filter(v => v)">
    <v-container fluid class="pt-1" slot="unified">
      <buff-table :effects="effects" :showHeaders="true" v-if="effects.length > 0"/>
      <span v-else>
        No effects found.
      </span>
    </v-container>
    <template slot="split-by-condition">
      <v-expansion-panel v-model="activeConditionSet">
        <v-expansion-panel-content v-for="(conditionSet, i) in conditionalEffects" :key="i">
          <h2 class="subheading" slot="header" style="text-transform: capitalize;">{{ conditionSet.condition }}</h2>
          <v-container fluid style="overflow-x: auto;">
            <buff-table :effects="conditionSet.effects" :showHeaders="true"/>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </template>
  </description-card-base>
</template>

<script>
import { mapGetters } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import BuffTable from '@/components/Multidex/BuffTable/MainTable';
import { splitEffectsByCondition } from '@/modules/core/extra-skills';

export default {
  props: {
    skill: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    BuffTable,
  },
  computed: {
    ...mapGetters('units', {
      unitById: 'getById',
    }),
    ...mapGetters('items', {
      itemById: 'getById',
    }),
    effects () {
      return (this.skill && this.skill.effects) || [];
    },
  },
  data: () => ({
    conditionalEffects: [],
    activeConditionSet: null,
  }),
  mounted () {
    this.conditionalEffects = splitEffectsByCondition(this.effects, { unitById: this.unitById, itemById: this.itemById });
    if (this.conditionalEffects.length === 1) {
      this.activeConditionSet = 0;
    }
  },
};
</script>
