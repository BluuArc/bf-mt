<template>
  <v-layout row wrap class="buff-list-row">
    <v-flex xs2 sm1 class="text-xs-center id-column center-align-parent">
      <span class="center-align-container">{{ getEffectId(effect) }}</span>
    </v-flex>
    <v-flex xs10 sm11 class="text-xs-center">
      <v-layout row v-for="(prop, j) in getSortedProps(effect).slice(1)" :key="j" class="buff-list-property-row">
        <template v-if="isProcBuffList(effect, prop)">
          <v-flex xs3 class="center-align-parent">
            <span class="center-align-container">{{ prop }}</span>
          </v-flex>
        <v-flex xs9>
          <proc-buff-list :effects="effect[prop]" :show-headers="false"/>
        </v-flex>  
        </template>
        <template v-else>
          <v-flex xs3>{{ prop }}</v-flex>
          <v-flex xs9 class="center-align-parent">
            <span :class="{ 'center-align-container': !Array.isArray(effect[prop]) || (Array.isArray(effect[prop]) && effect[prop].length === 0) }">
              {{ effect[prop] }}
              <span v-if="Array.isArray(effect[prop]) && effect[prop].length === 0">(None)</span>
            </span>
          </v-flex>
        </template>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import ProcBuffList from '@/components/Multidex/ProcBuffList';

export default {
  props: ['effect'],
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
      // console.debug(effect['passive id'], prop, +effect['passive id'] === 66 && prop === 'triggered effect', effect[prop]);
      return +effect['passive id'] === 66 && prop === 'triggered effect';
    },
  },
  name: 'passive-row',
};
</script>
