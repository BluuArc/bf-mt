<template>
  <v-container fluid class="buff-list">
    <v-layout row wrap v-if="showHeaders" class="buff-list-header">
      <v-flex xs2 sm1 class="text-xs-center">
        <b>ID</b>
      </v-flex>
      <v-flex xs10 sm11 class="text-xs-center">
        <v-layout row>
          <v-flex xs4><b>Buff Property</b></v-flex>
          <v-flex xs8><b>Buff Value</b></v-flex>
        </v-layout>
      </v-flex>
      <v-flex xs12 class="pa-0">
        <v-divider/>
      </v-flex>
    </v-layout>
    <template v-for="(effect, i) in effects">
      <v-layout row wrap class="buff-list-row" :key="i">
        <v-flex xs2 sm1 class="text-xs-center id-column">
          <span>{{ effect['passive id'] || effect['unknown passive id'] }}</span>
        </v-flex>
        <v-flex xs10 sm11 class="text-xs-center">
          <v-layout row v-for="(prop, j) in getSortedProps(effect).slice(1)" :key="j" class="buff-list-property-row">
            <v-flex xs4>{{ prop }}</v-flex>
            <v-flex xs8>{{ effect[prop] }}</v-flex>
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
    isPassiveEffect (effect) {
      return !!effect['passive id'] || !!effect['unknown passive id'];
    },
  },
};
</script>

<style>
.buff-list-row .id-column {
  position: relative;
}

.buff-list-row .id-column span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.theme--dark .buff-list-row .id-column {
  border-right: 1px solid var(--border-color-dark);
}

.theme--dark .buff-list-row:hover {
  background-color: dimgrey;
}

.theme--dark .buff-list-row .buff-list-property-row {
  border-bottom: 1px solid var(--border-color-dark);
}

.theme--dark .buff-list-row .buff-list-property-row:hover {
  background-color: grey;
}

.theme--light .buff-list-row .id-column {
  border-right: 1px solid var(--border-color-light);
}

.theme--light .buff-list-row:hover {
  background-color: lightgrey;
}

.theme--light .buff-list-row .buff-list-property-row {
  border-bottom: 1px solid var(--border-color-light);
}

.theme--light .buff-list-row .buff-list-property-row:hover {
  background-color: ghostwhite;
}
</style>
