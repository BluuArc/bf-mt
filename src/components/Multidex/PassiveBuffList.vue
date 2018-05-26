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
      <v-layout row wrap class="buff-list-row" :key="i">
        <v-flex xs2 sm1 class="text-xs-center id-column vertical-align-parent">
          <span class="vertical-align-container">{{ getEffectId(effect) }}</span>
        </v-flex>
        <v-flex xs10 sm11 class="text-xs-center">
          <v-layout row v-for="(prop, j) in getSortedProps(effect).slice(1)" :key="j" class="buff-list-property-row">
            <template v-if="isProcBuffList(effect, prop)">
              <v-flex xs3 class="vertical-align-parent">
                <span class="vertical-align-container">{{ prop }}</span>
              </v-flex>
            <v-flex xs9>
              <proc-buff-list :effects="effect[prop]" :show-headers="false"/>
            </v-flex>  
            </template>
            <template v-else>
              <v-flex xs3>{{ prop }}</v-flex>
              <v-flex xs9 class="vertical-align-parent">
                <span :class="{ 'vertical-align-container': !Array.isArray(effect[prop]) || (Array.isArray(effect[prop]) && effect[prop].length === 0) }">
                  {{ effect[prop] }}
                  <span v-if="Array.isArray(effect[prop]) && effect[prop].length === 0">(None)</span>
                </span>
              </v-flex>
            </template>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout row :key="`${i}-divider`">
        <v-divider/>
      </v-layout>
    </template>
  </v-container>
</template>

<script>
import ProcBuffList from '@/components/Multidex/ProcBuffList';

export default {
  props: {
    effects: {
      type: Array,
      default: [],
    },
    showHeaders: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  components: {
    'proc-buff-list': ProcBuffList,
  },
  methods: {
    getSortedProps (effect) {
      return Object.keys(effect)
        .sort((a, b) => {
          if (a.includes('passive id') || (!b.includes('passive id') && a < b)) {
            return -1;
          } else {
            return 1;
          }
        });
    },
    getEffectId (effect) {
      return effect['passive id'] || effect['unknown passive id'];
    },
    isProcBuffList (effect, prop) {
      console.debug(effect['passive id'], prop, +effect['passive id'] === 66 && prop === 'triggered effect');
      return +effect['passive id'] === 66 && prop === 'triggered effect';
    },
  },
};
</script>

<style>
.card .tabs__content .buff-list {
  max-height: 35vh;
  overflow-y: auto;
  padding-left: 16px;
  padding-right: 16px;
}
.theme--dark .buff-list-row .id-column {
  border-right: 1px solid var(--border-color-dark);
  border-left: 1px solid var(--border-color-dark);
}

.theme--dark .buff-list-row:hover {
  background-color: dimgrey;
}

.theme--dark .buff-list-row:first-child {
  border-top: 1px solid var(--border-color-dark);
}

.theme--dark .buff-list-row .buff-list-property-row {
  border-bottom: 1px solid var(--border-color-dark);
  border-right: 1px solid var(--border-color-dark);
}

.theme--dark .buff-list-row .buff-list-property-row:hover {
  background-color: grey;
}

.theme--light .buff-list-row .id-column {
  border-right: 1px solid var(--border-color-light);
  border-left: 1px solid var(--border-color-light);
}

.theme--light .buff-list-row:hover {
  background-color: lightgrey;
}

.theme--light .buff-list-row:first-child {
  border-top: 1px solid var(--border-color-light);
}

.theme--light .buff-list-row .buff-list-property-row {
  border-bottom: 1px solid var(--border-color-light);
  border-right: 1px solid var(--border-color-light);
}

.theme--light .buff-list-row .buff-list-property-row:hover {
  background-color: ghostwhite;
}
</style>
