<template>
  <v-navigation-drawer
    persistent right
    disable-route-watcher
    :clipped="$vuetify.breakpoint.lgAndUp"
    fixed app
    :value="showFilterSheet">
    <v-btn block @click="toggleFilterSheet(false)">
      Close Sidebar
      <v-spacer/>
      <v-icon right>chevron_right</v-icon>
    </v-btn>
    <h3 class="headline pl-3 pt-3">Filters</h3>
    <v-container fluid class="pa-0">
      <v-expansion-panel focusable>
        <element-panel :filterHelper="filterHelper" :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters"/>
        <rarity-panel :filterHelper="filterHelper" :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters" :minRarity="minRarity" :maxRarity="maxRarity"/>
        <unit-kind-panel :filterHelper="filterHelper" :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters"/>
        <gender-panel :filterHelper="filterHelper" :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters"/>
        <server-exclusives-panel :filterHelper="filterHelper" :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters" :otherServers="otherServers"/>
      </v-expansion-panel>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
import ElementPanel from './ElementPanel';
import RarityPanel from './RarityPanel';
import UnitKindPanel from './UnitKindPanel';
import GenderPanel from './GenderPanel';
import ServerExclusivesPanel from './ServerExclusivePanel';

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
    // array of strings indicating filter name
    requiredFilters: {
      type: Array,
      required: true,
    },
    disableFilters: {
      type: Boolean,
      default: false,
    },
    showFilterSheet: {
      type: Boolean,
      required: true,
    },
    minRarity: {
      type: Number,
      default: 0,
    },
    maxRarity: {
      type: Number,
      default: 8,
    },
    filterHelper: {
      required: true,
    },
    otherServers: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    ElementPanel,
    RarityPanel,
    UnitKindPanel,
    GenderPanel,
    ServerExclusivesPanel,
  },
  methods: {
    toggleFilterSheet (value) {
      this.$emit('togglesheet', value !== undefined ? !!value : !this.showFilterSheet);
    },
  },
  watch: {
    value: {
      deep: true,
      handler (newValue) {
        this.$emit('input', newValue);
      },
    },
  },
};
</script>
