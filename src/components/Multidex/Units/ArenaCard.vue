<template>
  <description-card-base
    :entry="aiData"
    materialColor="amber darken-3"
    :titleHtmlGenerator="() => 'Arena AI'"
    :tabNames="[aiData.length > 0 && 'Positioning', 'Translation', 'JSON'].filter(val => val)">
    <v-container fluid class="pa-0" slot="positioning">
      <v-layout row class="text-xs-center">
        <v-flex>
          <h2 class="subheading">Squad Position {{ suggestions.length === 1 ? 'Suggestion' : 'Suggestions' }}</h2>
        </v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-flex xs12 v-for="(s, i) in suggestions" :key="i" class="text-xs-center">
          {{ s }}
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex>
          <b>Note: </b> This experimental feature is not guaranteed to be correct. Cross check with the Translation tab if unsure.
        </v-flex>
      </v-layout>
    </v-container>
    <v-container fluid class="pa-0 unit-arena-stat-list" slot="translation">
      <v-layout v-if="aiData.length === 0">
        <v-flex>
          No arena data found.
        </v-flex>
      </v-layout>
      <template v-else>
        <v-layout row>
          <v-flex>

          </v-flex>
        </v-layout>

        <v-layout row wrap v-for="(stat, index) in aiData" :key="index">
          <v-flex>
            <span class="subheading">{{ generateArenaText(stat) }}</span>
          </v-flex>
        </v-layout>
      </template>
    </v-container>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import { getArenaPositionRecommendation, arenaConditionCodeToText } from '@/modules/core/units';

export default {
  props: {
    unit: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
  },
  computed: {
    aiData () {
      return (this.unit && Array.isArray(this.unit.ai)) ? this.unit.ai : [];
    },
    conditionMapping () {
      return {
        hp_50pr_under: 'has less than 50% HP',
        hp_50pr_over: 'has more than 50% HP',
        hp_75pr_under: 'has less than 75% HP',
        hp_25pr_under: 'has less than 25% HP',
        hp_min: 'has the lowest HP',
        hp_max: 'has the highest HP',
        atk_max: 'has the highest attack',
        random: 'is present',
      };
    },
    actionMapping () {
      return {
        skill: 'use BB/SBB',
        attack: 'normal attack',
      };
    },
    targetMapping () {
      return {
        party: 'when an ally',
        enemy: 'on enemy that',
      };
    },
    suggestions () {
      return getArenaPositionRecommendation(this.unit).map(arenaConditionCodeToText);
    },
  },
  methods: {
    generateArenaText (data = {}) {
      const chance = `${data['chance%']}% chance`;
      const action = this.actionMapping[data.action] || data.action;
      const target = this.targetMapping[data['target type']] || data['target type'];
      const condition = this.conditionMapping[data['target conditions']] || data['target conditions'];
      return `${chance} to ${action} ${target} ${condition}`;
    },
  },
  mounted () {
    
  },
};
</script>

<style lang="less">
.unit-arena-stat-list {
  & > .layout.row:not(:last-child) {
    border-bottom: 1px solid var(--background-color-alt);
  }
}
</style>
