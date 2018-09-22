<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <panel-header :hasFilters="hasFilters" title="Sphere Type"/>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.sphereTypes = sphereTypes.map(val => +val.value).slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.sphereTypes = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs12 v-for="type in sphereTypes" :key="type.value" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="type.value" v-model="value.sphereTypes" hide-details>
          <div slot="label" class="d-flex">
            <sphere-type-icon :category="type.value" class="d-align-self-center mr-1" :displaySize="24"/>
            <span class="d-align-self-center">{{ type.name }}</span>
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import SphereTypeIcon from '@/components/Multidex/Items/SphereTypeIcon';
import { sphereTypeMapping } from '@/modules/constants';

export default {
  mixins: [FilterPanelMixin],
  computed: {
    filterKey: () => 'sphereTypes',
    sphereTypes () {
      return Object.keys(sphereTypeMapping)
        .sort((a, b) => +a - +b)
        .map(key => ({ name: sphereTypeMapping[key], value: +key }));
    },
  },
  components: {
    SphereTypeIcon,
  },
};
</script>
