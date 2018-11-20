<template>
  <description-card-base
    :entry="aiData"
    materialColor="amber darken-3"
    :titleHtmlGenerator="() => 'Arena & Colosseum'"
    :tabNames="[coloClasses.length > 0 && 'Colo Class', aiData.length > 0 && 'Positioning', 'AI Translation', 'JSON'].filter(val => val)">
    <v-container fluid class="pt-1" slot="colo-class">
      <h2 class="subheading">{{ unit.name }} can be used in the following Colosseum classes</h2>
      <ul>
        <li v-for="(coloClass, i) in coloClasses" :key="i">
          <h3 class="subheading">{{ coloClass }}</h3>
        </li>
      </ul>
    </v-container>
    <v-container fluid class="pa-0" slot="positioning">
      <v-layout row class="text-xs-center">
        <v-flex>
          <h2 class="subheading">
            <span>Squad Position {{ suggestions.length === 1 ? 'Suggestion' : 'Suggestions' }}</span>
            <v-dialog
              v-model="showHelperDialog"
              max-width="768px">
              <v-btn icon slot="activator">
                <v-icon>help</v-icon>
              </v-btn>
            <v-card>
              <v-card-title>
                <h2 class="title">Arena Positioning Guide</h2>
              </v-card-title>
              <v-card-text>
                <v-container fluid class="pa-0">
                  <v-layout row wrap>
                    <v-flex xs12>
                      <img src="http://i.imgur.com/wEO3OU0.jpg" style="max-width: 100%;"/>
                    </v-flex>
                    <v-flex xs6 class="text-xs-left">
                      <v-btn small flat href="http://i.imgur.com/wEO3OU0.jpg" rel="noopener" target="_blank">
                        External Image Link
                      </v-btn>
                    </v-flex>
                    <v-flex xs6 class="text-xs-right">
                      <v-btn small flat href="https://www.reddit.com/comments/3q10nj" rel="noopener" target="_blank">
                        Image Source
                      </v-btn>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex>
                      <v-divider/>
                    </v-flex>
                  </v-layout>
                  <v-layout row>
                    <v-flex>
                      <span class="d-block">Postion Mapping from Squad Builder to Arena Position is as follows:</span>
                      <ol>
                        <li>Top Left (Squad) = Top Position (Arena)</li>
                        <li>Top Right (Squad) = Second from Top Position (Arena)</li>
                        <li>Middle (Squad) = Middle Position (Arena)</li>
                        <li>Bottom Right (Squad) = Second from Bottom Position (Arena)</li>
                        <li>Bottom Left (Squad) = Bottom Position (Arena)</li>
                      </ol>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn flat @click="showHelperDialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
            </v-dialog>
          </h2>
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
    <v-container fluid class="pa-0 unit-arena-stat-list" slot="ai-translation">
      <v-layout v-if="aiData.length === 0">
        <v-flex>
          No arena data found.
        </v-flex>
      </v-layout>
      <template v-else>
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
import { mapState } from 'vuex';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import { getArenaPositionRecommendation, arenaConditionCodeToText, getColoClassUsage } from '@/modules/core/units';

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
    ...mapState('units', ['activeServer']),
    coloClasses () {
      return this.unit ? getColoClassUsage(+this.unit.cost, this.activeServer === 'gl') : [];
    },
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
  data: () => ({
    showHelperDialog: false,
  }),
  methods: {
    generateArenaText (data = {}) {
      const chance = `${data['chance%']}% chance`;
      const action = this.actionMapping[data.action] || data.action;
      const target = this.targetMapping[data['target type']] || data['target type'];
      const condition = this.conditionMapping[data['target conditions']] || data['target conditions'];
      return `${chance} to ${action} ${target} ${condition}`;
    },
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
