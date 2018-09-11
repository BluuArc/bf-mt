<template>
  <v-container fluid class="buff-table">
    <v-layout row v-if="showHeaders" class="buff-table--header">
      <v-flex xs2 sm1 class="text-xs-center">
        ID
      </v-flex>
      <v-flex xs10 sm11 class="text-xs-center">
        <v-layout row>
          <v-flex xs3>Buff Property</v-flex>
          <v-flex xs9>Buff Value</v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-layout row class="buff-table--row d-align-items-center" v-for="(effectEntry, i) in mappedEffects" :key="i">
      <v-flex xs2 sm1 class="text-xs-center buff-table--id-column">
        {{ effectEntry.id }}
      </v-flex>
      <v-flex xs10 sm11 class="text-xs-center">
        <v-layout row v-for="(prop, j) in getSortedProps(effectEntry.effect)" :key="j" class="buff-table--property-columns">
          <v-flex xs3>
            {{ prop }}
          </v-flex>
          <v-flex xs9>
            {{ effectEntry.effect[prop] }}
            <span v-if="Array.isArray(effectEntry.effect[prop]) && effectEntry.effect[prop].length === 0">(None)</span>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
export default {
  props: {
    effects: {
      type: Array,
      default: () => [],
    },
    showHeaders: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    idKeys: () => ['passive id', 'unknown passive id', 'proc id', 'unknown proc id'],
    mappedEffects () {
      return this.effects.map(this.getEffectDetails);
    },
  },
  methods: {
    getEffectDetails (effect) {
      const type = getEffectType(effect);
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect).forEach(key => {
        if (!this.idKeys.includes(key)) {
          filteredEffect[key] = effect[key];
        }
      });
      return { type, id, effect: filteredEffect };
    },
    getSortedProps (effect) {
      return Object.keys(effect).sort((a, b) => a < b ? -1 : 1);
    },
  },
  name: 'buff-table',
};
</script>

<style lang="less">
.buff-table {
  .buff-table--header {
    font-weight: bold;
  }
}
</style>
