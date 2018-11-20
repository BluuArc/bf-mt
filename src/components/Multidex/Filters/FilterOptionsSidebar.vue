<template>
  <v-navigation-drawer
    persistent right
    disable-route-watcher
    :clipped="$vuetify.breakpoint.lgAndUp"
    fixed app
    :value="showFilterSheet"
    @input="toggleFilterSheet">
    <v-btn block @click="toggleFilterSheet(false)">
      Close Sidebar
      <v-spacer/>
      <v-icon right>chevron_right</v-icon>
    </v-btn>
    <h3 class="headline pl-3 pt-3">Filters</h3>
    <v-container fluid class="pa-0">
      <v-expansion-panel focusable>
        <element-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <rarity-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"
          :minRarity="minRarity" :maxRarity="maxRarity"/>
        <unit-kind-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <gender-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <item-type-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <sphere-type-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <craftables-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <usage-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <lad-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"
          @toggleladselector="$emit('toggleladselector', $event)"/>
        <associated-units-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <associated-items-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <gems-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <continues-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"/>
        <server-exclusive-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"
          :otherServers="otherServers"/>
        <proc-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"
          :isUnit="isUnit"
          @toggleprocselector="$emit('toggleprocselector', $event)"/>
        <passive-panel
          :filterHelper="filterHelper"
          :requiredFilters="requiredFilters"
          v-model="value"
          :disableFilters="disableFilters"
          :isUnit="isUnit"
          @togglepassiveselector="$emit('togglepassiveselector', $event)"/>
      </v-expansion-panel>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
import ElementPanel from './ElementPanel';
import RarityPanel from './RarityPanel';
import UnitKindPanel from './UnitKindPanel';
import GenderPanel from './GenderPanel';
import ItemTypePanel from './ItemTypePanel';
import SphereTypePanel from './SphereTypePanel';
import CraftablesPanel from './CraftablesPanel';
import UsagePanel from './UsagePanel';
import LadPanel from './LandAreaDungeonPanel';
import AssociatedItemsPanel from './AssociatedItemsPanel';
import GemsPanel from './GemsPanel';
import ContinuesPanel from './ContinuesPanel';
import AssociatedUnitsPanel from './AssociatedUnitsPanel';
import ServerExclusivePanel from './ServerExclusivePanel';
import ProcPanel from './ProcPanel';
import PassivePanel from './PassivePanel';

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
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ElementPanel,
    RarityPanel,
    UnitKindPanel,
    GenderPanel,
    ItemTypePanel,
    SphereTypePanel,
    CraftablesPanel,
    UsagePanel,
    LadPanel,
    AssociatedUnitsPanel,
    AssociatedItemsPanel,
    GemsPanel,
    ContinuesPanel,
    ServerExclusivePanel,
    ProcPanel,
    PassivePanel,
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
