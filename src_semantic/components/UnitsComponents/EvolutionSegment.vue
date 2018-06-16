<template>
  <div
    v-if="hasEvolution"
    class="ui raised segments">
    <div class="ui inverted violet segment">
      <b>Evolutions</b>
    </div>
    <div class="ui segment">
      <div class="ui segments">
        <div
          v-for="(evolution, index) in evolutions"
          :key="index"
          :class="{
            'ui center aligned segment': true,
            secondary: +evolution.current !== +unitData.id && +evolution.next !== +unitData.id,
            }">
          <h3 class="header">
            <img
              :src="getUnitImage(evolution.current)"
              :alt="getUnitName(evolution.current)"
              :title="getUnitName(evolution.current)"
              class="ui mini spaced image">
            <b>{{ getUnitName(evolution.current, true) }}</b>
            <i class="chevron right icon"></i>
            <img
              :src="getUnitImage(evolution.next)"
              :alt="getUnitName(evolution.next)"
              :title="getUnitName(evolution.next)"
              class="ui mini spaced image">
            <b>{{ getUnitName(evolution.next, true) }}</b>
          </h3>
          <div class="ui mini images">
            <img
              v-for="(mat, matIndex) in evolution.mats"
              :key="matIndex"
              :src="getUnitImage(mat.id)"
              :alt="mat.name"
              :title="mat.name"
              class="ui image"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { storeMethods } from '@/store';

export default {
  props: ['unitData'],
  computed: {
    hasEvolution() {
      return this.unitData.next || this.unitData.prev || this.unitData.evo_mats;
    },
    evolutions() {
      if (!this.hasEvolution) {
        return [];
      }

      const evolutions = [];
      let tempUnit = this.unitData;
      while (tempUnit.prev) {
        tempUnit = storeMethods.getUnit(this.$store.state, tempUnit.prev);
      }

      while (tempUnit.next) {
        evolutions.push({
          current: tempUnit.id,
          next: tempUnit.next,
          mats: tempUnit.evo_mats,
        });
        tempUnit = storeMethods.getUnit(this.$store.state, tempUnit.next);
      }

      return evolutions;
    },
  },
  methods: {
    getUnitName(id, rarity = false) {
      const unit = storeMethods.getUnit(this.$store.state, id);
      let result = unit.name;
      if (rarity) {
        result += ` (${unit.rarity === 8 ? 'OE' : `${unit.rarity}*`})`;
      }
      return result;
    },
    getUnitImage(id) {
      return storeMethods.getUnitImageURLs(this.$store.state, id).ills_thum;
    },
  },
  mounted() {
    // eslint-disable-next-line
    console.warn('TODO: Add support for Item Evolution Materials in Unit Card');
  },
};
</script>
