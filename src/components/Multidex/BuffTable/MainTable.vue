<template>
  <v-container fluid class="buff-table pa-0">
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
        <v-layout row v-for="(prop, j) in getSortedProps(effectEntry.effect)" :key="j" class="buff-table--property-row d-align-items-center">
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
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-hover-color: var(--background-color-alt--lighten-2);

  .buff-table--header {
    font-weight: bold;
  }

  .buff-table--row {
    border-left: 1px solid var(--table-border-color);
    border-right: 1px solid var(--table-border-color);
    border-top: 1px solid var(--table-border-color);

    &:hover {
      background-color: var(--table-background-color);
    }

    &:last-child {
      border-bottom: 1px solid var(--table-border-color);
    }

    .buff-table--property-row {
      border-left: 1px solid var(--table-border-color);

      &:not(:last-child) {
        border-bottom: 1px solid var(--table-border-color);
      }
      min-height: 36px;

      &:hover {
        background-color: var(--table-hover-color);
      }
    }
  }
}
</style>
