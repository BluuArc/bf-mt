<template>
  <v-expansion-panel-content v-if="showPanel">
    <div slot="header">
      <h2 class="subheading">Rarity</h2>
    </div>
    <v-layout row>
      <v-flex class="text-xs-left">
        <v-btn outline class="mr-0" :disabled="disableFilters" @click="value.rarity = rarityRange.slice()">All</v-btn>
      </v-flex>
      <v-flex class="text-xs-right">
        <v-btn outline class="ml-0" :disabled="disableFilters" @click="value.rarity = []">None</v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="ml-2 mr-2 pb-3">
      <v-flex xs4 v-for="rarity in rarityRange" :key="rarity" class="text-xs-center">
        <v-checkbox :disabled="disableFilters" :value="rarity" v-model="value.rarity" hide-details>
          <div slot="label" class="d-flex">
            <span v-if="rarity < 8">{{ rarity }}</span>
            <rarity-icon :class="{ 'd-align-self-center': true, 'ml-1': rarity !== 8 }" :rarity="rarity" :displaySize="18"/>
          </div>
        </v-checkbox>
      </v-flex>
    </v-layout>
  </v-expansion-panel-content>
</template>

<script>
import FilterPanelMixin from './FilterPanelMixin';
import RarityIcon from '@/components/Multidex/RarityIcon';

export default {
  mixins: [FilterPanelMixin],
  props: {
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
    RarityIcon,
  },
  computed: {
    rarityRange () {
      return Object.keys(new Array(this.maxRarity - this.minRarity + 1).fill(0)).map(i => +i + this.minRarity);
    },
    showPanel () {
      return this.requireFilter || this.requiredFilters.includes('rarity');
    },
  },
};
</script>
