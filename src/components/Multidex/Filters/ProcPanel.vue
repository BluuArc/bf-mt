<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Active (Proc) Buffs"/>
    </div>
    <!-- <v-layout row class="ml-2 mr-2">
      <v-flex>
        <v-btn outline :disabled="disableFilters" class="mr-0" @click="resetProcs">Reset</v-btn>
      </v-flex>
    </v-layout> -->
    <v-layout row wrap class="ml-2 mr-2" v-if="isUnit">
      <v-flex xs4 class="pa-0" v-for="option in defaultSearchOptions" :key="option" @click="showProcSelector" style="cursor: pointer;">
        <v-checkbox :disabled="disableFilters" hide-details :value="option" v-model="value.procBuffSearchOptions" style="pointer-events: none">
          <div slot="label" v-text="option.toUpperCase()"/>
        </v-checkbox>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex @click="showProcSelector" style="cursor: pointer;">
        <v-combobox
          :value="value.procs"
          disabled
          label="Click to Select Active Buffs"
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
    filterKey: () => 'procs',
    defaultSearchOptions () {
      return this.filterHelper.defaultValues.procBuffSearchOptions;
    },
  },
  methods: {
    showProcSelector () {
      this.$emit('toggleprocselector', true);
    },
    resetProcs () {
      this.value.procs = this.filterHelper.defaultValues.procs;
      this.value.procBuffSearchOptions = this.filterHelper.defaultValues.procBuffSearchOptions;
    },
  },
};
</script>

