<template>
  <v-layout row wrap class="pa-2">
    <v-flex xs12>
      {{ activeUnit }}
    </v-flex>
    <v-flex xs12>
      Unit selector: {{ activeUnit.id }}
    </v-flex>
    <v-flex xs12 sm4>
      Position Selector {{ activeUnit.position }}
    </v-flex>
    <v-flex xs6 sm4>
      BB Order Selector {{ activeUnit.bbOrder}}
    </v-flex>
    <v-flex xs6 sm4>
      BB Type Selector {{ activeUnit.bbType }}
    </v-flex>
    <v-flex xs12>
      Extra Skill selector {{ activeUnit.es }}
    </v-flex>
    <v-layout row>
      <v-flex xs12 sm6>
        Sphere 1 Selector {{ activeUnit.spheres[0] }}
      </v-flex>
      <v-flex xs12 sm6>
        Sphere 2 Selector {{ activeUnit.spheres[1] }}
      </v-flex>
    </v-layout>
    <v-flex xs12>
      SP Builder {{ activeUnit.sp }}
    </v-flex>
  </v-layout>
</template>

<script>
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    selectedIndex: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    activeUnit () {
      return this.squad.units[this.selectedIndex] || {};
    },
  },
};
</script>

<style>

</style>
