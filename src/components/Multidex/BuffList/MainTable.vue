<template>
  <v-container fluid class="buff-list">
    <v-layout row wrap v-if="showHeaders" class="buff-list-header">
      <v-flex xs2 sm1 class="text-xs-center">
        <b>ID</b>
      </v-flex>
      <v-flex xs10 sm11 class="text-xs-center">
        <v-layout row>
          <v-flex xs3><b>Buff Property</b></v-flex>
          <v-flex xs9><b>Buff Value</b></v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 class="pa-0">
        <v-divider/>
      </v-flex>
    </v-layout>
    <template v-for="(effect, i) in effects">
      <passive-row :key="i" v-if="isPassiveBuffEffect(effect)" :effect="effect"/>
      <proc-row :key="i" v-else :effect="effect"/>
    </template>
  </v-container>
</template>

<script>
import ProcRow from '@/components/Multidex/BuffList/ProcRow';
import PassiveRow from '@/components/Multidex/BuffList/PassiveRow';

export default {
  props: {
    effects: {
      type: Array,
      default: () => [],
    },
    showHeaders: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  components: {
    'proc-row': ProcRow,
    'passive-row': PassiveRow,
  },
  methods: {
    isPassiveBuffEffect (effect) {
      return typeof (effect['passive id'] || effect['unknown passive id']) !== 'undefined';
    },
  },
  name: 'buff-list',
};
</script>
