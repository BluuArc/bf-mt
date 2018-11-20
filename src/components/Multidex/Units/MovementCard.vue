<template>
  <description-card-base
    :entry="unit"
    materialColor="light-green"
    :tabNames="['General', hasHitCountData && 'Hitcounts'].filter(val => val)">
    <template slot="title">
      <v-layout row wrap>
        <v-flex xs12 sm8 md9 class="text-xs-left">
          Movement Info
        </v-flex>
        <v-flex xs12 sm4 md3 class="text-xs-right">
          <v-tooltip bottom>
            <span slot="activator" style="border-bottom: 1px dotted;" class="body-1">
              {{ dcInfo.hits }} {{ dcInfo.hits === 1 ? 'Hit' : 'Hits' }}/{{ dcInfo.dropchecks }} DC
            </span>
            <span>
              Hits on Normal Attack / Total BC Dropchecks
            </span>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </template>
    <template slot="general">
      <v-container fluid class="pa-0">
        <v-layout row class="d-align-items-center">
          <v-flex xs4 class="text-xs-center"><b>Attack Type</b></v-flex>
          <v-flex xs4 class="text-xs-center"><b>Move Speed<br>(Move Speed Type)</b></v-flex>
          <v-flex xs4 class="text-xs-center"><b>Move Type</b></v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs4 class="text-xs-center"><b>Normal Attack</b></v-flex>
          <v-flex xs4 class="text-xs-center">
            {{ movementData.attack['move speed'] }}
            ({{ movementData.attack['move speed type'] }})
          </v-flex>
          <v-flex xs4 class="text-xs-center">
            {{ getMoveType(unit, true) }}
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs4 class="text-xs-center"><b>BB/SBB/UBB</b></v-flex>
          <v-flex xs4 class="text-xs-center">
            {{ movementData.skill['move speed'] }}
            ({{ movementData.skill['move speed type'] }})
          </v-flex>
          <v-flex xs4 class="text-xs-center">
            {{ getMoveType(unit, false) }}
          </v-flex>
        </v-layout>
      </v-container>
    </template>
    <template slot="hitcounts">
      <hit-count-table :attack="unit['damage frames']" class="pa-0"/>
    </template>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import HitCountTable from '@/components/Multidex/HitCountTable';
import { getDropCheckInfo, getMoveType } from '@/modules/core/units';

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
    HitCountTable,
  },
  computed: {
    dcInfo () {
      return getDropCheckInfo(this.unit);
    },
    movementData () {
      return this.unit.movement;
    },
    hasHitCountData () {
      return this.unit && this.unit['damage frames'] && this.unit['damage frames'].hits > 0;
    },
  },
  methods: {
    getMoveType,
  },
};
</script>
