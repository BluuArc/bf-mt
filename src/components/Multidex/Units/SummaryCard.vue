<template>
  <description-card-base
    class="summary-card"
    :entry="unit"
    materialColor="blue"
    :titleHtmlGenerator="() => `<b>Buff Overview</b>`"
    :tabNames="['Overview']"
  >
  <template slot="overview">
    <v-layout column>
      <v-flex>
        <v-btn block flat large @click="isShowing = !isShowing">{{ buttonText }}</v-btn>
      </v-flex>
      <v-slide-y-transition>
        <div v-show="isShowing" style="overflow-x: auto;">
          <!-- <buff-table-grid :effects="effects" v-if="hasShownBuffTable" :showHeaders="true"/> -->
          It's showing {{ buffSources }}
        </div>
      </v-slide-y-transition>
    </v-layout>
  </template>
  </description-card-base>
</template>

<script>
import { getEffectsListForUnit } from '@/modules/core/units';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';

function getNameOrId (entry = {}) {
  return entry.name || entry.id;
}
export default {
  props: {
    unit: {
      type: Object,
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
  },
  computed: {
    buttonText () {
      return `${this.isShowing ? 'Hide' : 'Show'} Buff Overview`;
    },
    buffSources () {
      const unitData = this.unit || {};
      return [
        ['leader skill', 'ls'],
        ['extra skill', 'es'],
        ['bb'],
        ['sbb'],
        ['ubb'],
        ['feskills', 'sp'],
      ].map(([unitKey, sourceKey]) => ({
        unitKey,
        sourceKey: sourceKey || unitKey,
        name: unitKey !== 'feskills' ? getNameOrId(unitData[unitKey]) : 'SP Enhancements',
      }));
    },
  },
  data () {
    return {
      isShowing: false,
      hasShown: false,
    };
  },
  methods: {
    getEffectsFromSource ({ sourceKey } = {}, targetType, effectType) {
      return getEffectsListForUnit({
        unit: this.unit,
        target: targetType,
        effectType,
        whitelistedSources: [sourceKey],
      });
    },
  },
  watch: {
    isShowing (showing) {
      if (showing && !this.hasShown) {
        this.hasShown = true;
      }
    },
  },
};
</script>

<style>

</style>
