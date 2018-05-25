<template>
  <v-card>
    <v-card-title class="light-green">
      <h3 class="title">Movement Info</h3>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-tabs v-model="activeTab">
        <v-tab key="general">
          General
        </v-tab>
        <v-tab key="table">
          Hitcount Table
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="activeTab">
        <v-tab-item key="general">
          <v-container fluid>
            <v-layout row>
              <v-flex xs4 class="text-xs-center"><b>Attack Type</b></v-flex>
              <v-flex xs4 class="text-xs-center"><b>Move Speed</b></v-flex>
              <v-flex xs4 class="text-xs-center"><b>Move Type</b></v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs4 class="text-xs-center"><b>Normal Attack</b></v-flex>
              <v-flex xs4 class="text-xs-center">
                {{ movementData.attack['move speed'] }}
                ({{ movementData.attack['move speed type'] }})
              </v-flex>
              <v-flex xs4 class="text-xs-center">
                {{ getMoveType(movementData.attack['move type']) }}
              </v-flex>
            </v-layout>
            <v-layout row>
              <v-flex xs4 class="text-xs-center"><b>BB/SBB/UBB</b></v-flex>
              <v-flex xs4 class="text-xs-center">
                {{ movementData.skill['move speed'] }}
                ({{ movementData.skill['move speed type'] }})
              </v-flex>
              <v-flex xs4 class="text-xs-center">
                {{ getMoveType(movementData.skill['move type']) }}
              </v-flex>
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="table">
          <hit-count-table :attack="unit['damage frames']"/>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script>
import HitCountTable from '@/components/Multidex/Units/HitCountTable';

export default {
  props: ['unit'],
  components: {
    'hit-count-table': HitCountTable,
  },
  computed: {
    movementData () {
      return this.unit.movement;
    },
    damageFrames () {
      return this.unit['drop check count'];
    },
    dropChecks () {
      return this.unit['damage frames'];
    },
    hasHitCounts () {
      return this.damageFrames && this.damageFrames.hits > 0;
    },
    dcInfo () {
      let numHits = 0;
      let dropChecks = 0;
      if (this.hasHitCounts) {
        numHits = +this.damageFrames.hits;
        dropChecks = this.dropChecks * numHits;
      }
      return [
        `<abbr title="Hits on Normal Attack">${numHits} ${numHits === 1 ? 'Hit' : 'Hits'}</abbr>`,
        `<abbr title="total BC dropchecks">${dropChecks} DC</abbr>`,
      ].join('/');
    },
  },
  data () {
    return {
      activeTab: '',
    };
  },
  methods: {
    getMoveType (input) {
      const types = {
        1: 'Moving',
        2: 'Teleporting',
        3: 'Non-Moving',
      };
      return types[+input] || `Unknown Move Type ${input}`;
    },
  },
};
</script>
