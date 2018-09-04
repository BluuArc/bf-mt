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
        <element-panel :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters"/>
        <rarity-panel :requiredFilters="requiredFilters" v-model="value" :disableFilters="disableFilters" :minRarity="minRarity" :maxRarity="maxRarity"/>
      </v-expansion-panel>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
import ElementPanel from './ElementPanel';
import RarityPanel from './RarityPanel';

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
  },
  components: {
    ElementPanel,
    RarityPanel,
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
