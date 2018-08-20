<template>
  <v-layout row wrap class="buff-list-row">
    <v-flex xs2 sm1 class="text-xs-center id-column center-align-parent">
      <span class="center-align-container">{{ getEffectId(effect) }}</span>
    </v-flex>
    <v-flex xs10 sm11 class="text-xs-center">
      <v-layout row v-for="(prop, j) in getSortedProps(effect).slice(1)" :key="j" class="buff-list-property-row">
        <v-flex xs3>{{ prop }}</v-flex>
        <v-flex xs9 class="center-align-parent">
          <span :class="{ 'center-align-container': !Array.isArray(effect[prop]) || (Array.isArray(effect[prop]) && effect[prop].length === 0) }">
            {{ effect[prop] }}
          </span>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>

export default {
  props: ['effect'],
  methods: {
    getSortedProps (effect) {
      return Object.keys(effect)
        .sort((a, b) => {
          if (a.includes('proc id') || (!b.includes('proc id') && a < b)) {
            return -1;
          } else {
            return 1;
          }
        });
    },
    getEffectId (effect) {
      return effect['proc id'] || effect['unknown proc id'];
    },
  },
};
</script>
