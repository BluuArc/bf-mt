<template>
  <v-card>
    <v-card-title class="indigo white--text">
      <h3 class="title">Associated Units</h3>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap>
        <v-flex xs12>
          The following units have this leader skill:
        </v-flex>
        <v-flex xs12 sm6 md4 v-for="(id, i) in units" :key="i">
            <unit-card
              class="pa-1 card--raised"
              :to="`/multidex/units/?unitId=${id}`"
              :unit="unitById(id)"
              style="height: 100%;"/>
        </v-flex>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import UnitCard from '@/components/Multidex/Units/UnitCard';
export default {
  props: ['units'],
  components: {
    'unit-card': UnitCard,
  },
  computed: {
    ...mapGetters('units', ['unitById']),
  },
};
</script>
