<template>
  <v-card>
    <v-card-title class="green darken-2 white--text">
      <v-layout row wrap>
        <v-flex xs6 sm8 md9 class="text-xs-left">
          <h3 class="title">Hit Count Info</h3>
        </v-flex>
        <v-flex xs6 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;">
              {{ bcdcInfo.cost }} BC/{{ bcdcInfo.hits }} {{ bcdcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ bcdcInfo.dropchecks }} DC
            </span>
            <span>
              BC required to fill BC gauge / Hits on Burst / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </v-card-title>
    <v-card-text class="pt-0">
      <div v-if="hitCountData.length === 0" class="pt-2">
        <h3 class="subheading">No hitcount data.</h3>
      </div>
      <template v-else>
        <v-tabs v-model="activeTab" class="pb-2">
          <v-tab v-for="(attack, i) in hitCountData" :key="i">
            Attack {{ i + 1 }} ({{ attack.target }})
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="activeTab" touchless>
          <v-tab-item v-for="(attack, i) in hitCountData" :key="i">
            <v-container fluid class="pa-0">
              <v-layout row wrap>
                <v-flex xs12 md6 class="text-xs-center">
                  <h3 class="subheading"><b>Miscellaneous Info</b></h3>
                  <v-layout row wrap v-for="(stat, j) in generateAttackStats(attack)" :key="j">
                    <v-flex xs6>
                      <b>{{ stat.label }}</b>
                    </v-flex>
                    <v-flex xs6>
                      {{ stat.value }}
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex xs12 md6 class="text-xs-center">
                  <h3 class="subheading"><b>Effects Info</b></h3>
                  <effect-list class="pt-0" :effects="[attack.effects]" style="max-height: 20vh;"/>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12>
                  <v-divider/>
                </v-flex>
              </v-layout>
              <v-layout row>
                <v-flex xs12 class="text-xs-center">
                  <h3 class="subheading"><b>Hit Count Table</b></h3>
                  <hit-count-table class="pl-3 pr-3" :attack="attack.frames" style="max-height: 50vh; overflow-y: auto;"/>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
        </v-tabs-items>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import EffectList from '@/components/Multidex/EffectList/MainTable';
import HitCountTable from '@/components/Multidex/Units/HitCountTable';

export default {
  props: ['burst'],
  components: {
    'effect-list': EffectList,
    'hit-count-table': HitCountTable,
  },
  computed: {
    numLevels () {
      return this.burst ? this.burst.levels.length : 0;
    },
    attackingProcs: () => ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']),
    bcdcInfo () {
      if (!this.burst) {
        return {};
      }

      const endLevel = this.burst.levels[this.numLevels - 1];

      const attacks = endLevel.effects
        .map((e, i) => ({
          'proc id': e['proc id'] || e['unknown proc id'],
          hits: e.hits || this.burst['damage frames'][i].hits || 0,
        })).filter(e => this.attackingProcs.includes(e['proc id']));
      const numHits = attacks.reduce((acc, val) => (acc + +val.hits), 0);
      const dropChecks = numHits * +this.burst['drop check count'];

      return {
        cost: endLevel['bc cost'],
        hits: numHits,
        dropchecks: dropChecks,
      };
    },
    hitCountData () {
      const endLevel = this.burst.levels[this.numLevels - 1];
      return this.burst['damage frames']
        .map((f, i) => {
          const effectData = endLevel.effects[i];
          return {
            target: (effectData['random attack'] ? 'random' : effectData['target area']),
            id: (f['proc id'] || f['unknown proc id']).toString(),
            frames: f,
            effects: effectData,
            hits: effectData.hits || f.hits || 0,
          };
        }).filter(f => this.attackingProcs.includes(f.id));
    },
  },
  data () {
    return {
      activeTab: 0,
    };
  },
  methods: {
    generateAttackStats (hitCountData) {
      return [
        { label: (hitCountData.frames['proc id'] ? 'Proc ID' : 'Unknown Proc ID'), value: hitCountData.id },
        { label: 'Number of Hits', value: hitCountData.hits },
        { label: 'Effect Delay (ms/frame)', value: hitCountData.frames['effect delay time(ms)/frame'] },
        { label: 'Total Hit Damage% Distribution', value: hitCountData.frames['hit dmg% distribution (total)'] },
      ];
    },
  },
};
</script>
