<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Land, Area, Dungeon"/>
    </div>
    <v-layout row class="ml-2 mr-2" v-for="(type, i) in missionLocationTypes" :key="i">
      <v-flex @click="showLadSelector" style="cursor: pointer;">
        <v-combobox
          :value="value[type]"
          disabled
          :label="`Click to filter by ${type}`"
          :hint="`Empty selection is equivalent to showing all ${type}s.`"
          multiple
          persistent-hint>
          <template slot="selection" slot-scope="data">
            <v-chip
              :selected="data.selected"
              :key="JSON.stringify(data.item)"
              small class="v-chip--select-multi">
              {{ data.item }}
            </v-chip>
          </template>
        </v-combobox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import { missionLocationTypes } from '@/modules/constants';
import FilterPanelMixin from './FilterPanelMixin';

export default {
  mixins: [FilterPanelMixin],
  computed: {
    missionLocationTypes: () => missionLocationTypes,
    // custom overrides, as we're merging 3 filters into 1 panel
    showPanel () {
      return this.requireFilter || this.missionLocationTypes.some(type => this.requiredFilters.includes(type));
    },
    hasFilters () {
      return this.missionLocationTypes.some(type => this.filterHelper.hasFilters(this.value, type));
    },
  },
  methods: {
    showLadSelector () {
      this.$emit('toggleladselector', true);
    },
    resetValues () {
      this.missionLocationTypes.forEach(type => {
        this.value[type] = this.filterHelper.defaultValues[type];
      });
    },
  },
};
</script>

<style>

</style>
