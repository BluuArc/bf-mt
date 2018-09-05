<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Server Exclusives"/>
    </div>
    <v-layout row class="ml-2 mr-2">
      <v-flex v-if="!hasOtherServers">
        Please download data from the <router-link to="/settings" style="color: inherit">Settings Page</router-link> for at least one other server to use this filter.
      </v-flex>
      <v-flex v-else>
        {{ otherServersMessage }}
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex>
        <v-radio-group v-model="value.exclusives">
          <v-radio
            v-for="(option, i) in options"
            :key="i"
            :disabled="disableFilters || !hasOtherServers"
            :value="option"
            :label="labelMapping[i]"/>
        </v-radio-group>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import { exclusiveFilterOptions } from '@/modules/constants';

export default {
  mixins: [FilterPanelMixin],
  props: {
    otherServers: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    options: () => exclusiveFilterOptions.valuesArray,
    filterKey: () => 'exclusives',
    labelMapping: () => ['All', 'Exclusives Only', 'Non-Exclusives Only'],
    hasOtherServers () {
      return this.otherServers.length > 0;
    },
    otherServersMessage () {
      return `Will compare against the cached entries of ${this.otherServers.map(s => s.toUpperCase()).join(' and ')}`
    },
  },
  mounted () {
    if (!this.hasOtherServers && this.value.exclusives !== this.options[0]) {
      this.value.exclusives = this.options[0];
    }
  },
  watch: {
    value: {
      deep: true,
      handler () {
        if (!this.hasOtherServers && this.value.exclusives !== this.options[0]) {
          this.value.exclusives = this.options[0];
        } else {
          this.emitChange();
        }
      },
    },
  },
};
</script>
