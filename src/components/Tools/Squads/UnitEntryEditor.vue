<template>
  <v-layout row wrap class="unit-entry-editor">
    <!-- <v-flex xs12>
      {{ activeUnit }}
    </v-flex> -->
    <v-layout row style="width: 100%;" wrap>
      <!-- <v-btn flat @click="activeDialog = 'units'">
        Unit selector: {{ activeUnit.id }}
      </v-btn> -->
      <v-flex xs12 sm6>
        <unit-card :key="activeUnit" :entry="unitData" class="no-highlight"/>
      </v-flex>
      <v-layout row wrap grid>
        <v-flex xs12 class="px-1">
          <v-btn block>
            Select Unit
          </v-btn>
        </v-flex>
        <v-flex sm6 class="px-1">
          <v-btn block>
            Set Empty
          </v-btn>
        </v-flex>
        <v-flex sm6 class="px-1">
          <v-btn block>
            Set Any
          </v-btn>
        </v-flex>
      </v-layout>
      <!-- <v-dialog
        :value="activeDialog === 'units'"
        @input="($ev) => activeDialog = $ev ? 'units' : ''"
        fullscreen
        hide-overlay
        lazy
        transition="dialog-bottom-transition">
        <unit-selector :isSelectMode="true" @input="onSelectUnit"/>
      </v-dialog> -->
    </v-layout>
    <v-flex xs12>
      <v-container fluid grid-list-md class="pa-1">
        <v-flex xs12>
          Position
        </v-flex>
        <v-layout row wrap>
          <v-flex
            v-for="position in unitPositionMapping"
            :key="position"
            xs12 sm6>
            <v-btn block :color="position === activeUnit.position ? 'primary' : undefined">
              {{ position }}
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
    <v-flex xs12 sm4>
      Lead/Friend selector
      <!-- <v-select :items=""
      <v-layout align-items-center row wrap>
        <v-flex xs12 md4 class="px-1">
          <v-btn block>
            Leader
          </v-btn>
        </v-flex>
        <v-flex xs12 md4 class="px-1">
          <v-btn block>
            Friend
          </v-btn>
        </v-flex>
        <v-flex xs12 md4 class="px-1">
          <v-btn block>
            Neither
          </v-btn>
        </v-flex>
      </v-layout> -->
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
import UnitCard from '@/components/Multidex/Units/EntryCard';
import { Logger } from '@/modules/Logger';
import { squadFillerMapping, unitPositionMapping } from '@/modules/constants';
import { isValidUnit, getFillerUnit } from '@/modules/core/units';
import { cloneSquad } from '@/modules/core/squads';

const logger = new Logger({ prefix: '[UnitEntryEditor]' });
export default {
  mixins: [GettersMixin],
  components: {
    UnitCard,
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
    unitData () {
      const initialData = this.getUnit(this.activeUnit.id);
      return isValidUnit(initialData)
        ? initialData
        : getFillerUnit(this.activeUnit.id === squadFillerMapping.EMPTY);
    },
    unitPositionMapping: () => unitPositionMapping,
    leadFriendPossibilities: () => ['Leader', 'Friend', 'Neither'],
    // leadFriendStatus () {
    //   if ()
    // },
  },
  data () {
    return {
      activeDialog: '',
      localSquad: {},
    };
  },
  methods: {
    onSelectUnit (input) {
      logger.warn(input);
      this.activeDialog = '';
    },
  },
  watch: {
    squad: {
      immediate: true,
      deep: true,
      handler (value) {
        this.localSquad = cloneSquad(value);
      },
    },
  },
};
</script>

<style lang="less" scoped>
.unit-entry-editor {
  & > * {
    border: 1px solid var(--background-color-alt);
  }
}
</style>
