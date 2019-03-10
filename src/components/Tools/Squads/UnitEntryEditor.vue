<template>
  <v-layout row wrap class="pa-2">
    <v-flex xs12>
      {{ activeUnit }}
    </v-flex>
    <v-flex xs12>
      <v-btn @click="activeDialog = 'units'">
        Unit selector: {{ activeUnit.id }}
      </v-btn>
      <!-- <v-dialog
        :value="activeDialog === 'units'"
        @input="($ev) => activeDialog = $ev ? 'units' : ''"
        fullscreen
        hide-overlay
        lazy
        transition="dialog-bottom-transition">
        <unit-selector :isSelectMode="true" @input="onSelectUnit"/>
      </v-dialog> -->
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
import UnitSelector from '@/views/Multidex/Units';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: '[UnitEntryEditor]' });
export default {
  mixins: [GettersMixin],
  components: {
    UnitSelector,
  },
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
  data () {
    return {
      activeDialog: '',
    };
  },
  methods: {
    onSelectUnit (input) {
      logger.warn(input);
      this.activeDialog = '';
    },
  },
};
</script>

<style>

</style>
