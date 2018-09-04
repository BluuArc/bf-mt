<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <h2 class="subheading">Element</h2>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.elements = elements.slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.elements = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs4 v-for="(element, i) in elements" :key="i" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="element" v-model="value.elements" hide-details>
          <div slot="label">
            <element-icon :element="element" :displaySize="24"/>
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import { elements } from '@/modules/constants';
import ElementIcon from '@/components/Multidex/ElementIcon';

export default {
  mixins: [FilterPanelMixin],
  components: {
    ElementIcon,
  },
  computed: {
    elements: () => elements,
    showPanel () {
      return this.requireFilter || this.requiredFilters.includes('elements');
    },
  },
};
</script>
