<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Passive Buffs"/>
    </div>
    <v-layout row wrap class="ml-2 mr-2" v-if="isUnit">
      <v-flex xs4 class="pa-0" v-for="option in defaultSearchOptions" :key="option" @click="showPassiveSelector" style="cursor: pointer;">
        <v-checkbox :disabled="disableFilters" hide-details :value="option" v-model="value.passiveBuffSearchOptions" style="pointer-events: none">
          <div slot="label" v-text="option.toUpperCase()"/>
        </v-checkbox>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex @click="showPassiveSelector" style="cursor: pointer;">
        <v-combobox
          :value="value.passives"
          disabled
          label="Click to Select Passive Buffs"
          hint="Empty selection is equivalent to showing all."
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
import FilterPanelMixin from './FilterPanelMixin';

export default {
  mixins: [FilterPanelMixin],
  props: {
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    filterKey: () => 'passives',
    defaultSearchOptions () {
      return this.filterHelper.defaultValues.passiveBuffSearchOptions
    },
  },
  methods: {
    showPassiveSelector () {
      this.$emit('togglepassiveselector', true);
    },
    resetProcs () {
      this.value.passives = this.filterHelper.defaultValues.passives;
      this.value.passiveBuffSearchOptions = this.filterHelper.defaultValues.passiveBuffSearchOptions;
    },
  },
};
</script>

