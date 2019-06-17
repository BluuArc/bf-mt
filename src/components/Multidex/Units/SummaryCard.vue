<template>
  <base-summary-card
    :entry="unit"
    :buffSources="buffSources"
    :getEffectsFromSource="getEffectsFromSource"
    initialViewMode="target"
  >
    <span slot="allentrypreview" slot-scope="{ entries }">
      <span v-for="source in entries" :key="source.sourceKey">
        <v-chip
          small
          tabindex="-1"
          :color="getColorMappingForSourceKey(source.sourceKey).background"
          :text-color="getColorMappingForSourceKey(source.sourceKey).text"
        >
          {{ source.sourceKey.toUpperCase() }}
        </v-chip>
      </span>
    </span>
    <span slot="value-header" slot-scope="{ entry }">
      {{ getHeaderTextForSource(entry) }}
    </span>
  </base-summary-card>
</template>

<script>
import { getEffectsListForUnit } from '@/modules/core/units';
import { MATERIAL_COLOR_MAPPING } from '@/modules/constants';
import BaseSummaryCard from '@/components/Multidex/BaseSummaryCard';

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
    BaseSummaryCard,
  },
  computed: {
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
  methods: {
    getEffectsFromSource ({ sourceKey } = {}, target, effectType) {
      return getEffectsListForUnit({
        unit: this.unit,
        target,
        effectType,
        whitelistedSources: [sourceKey],
      });
    },
    getColorMappingForSourceKey (sourceKey) {
      return MATERIAL_COLOR_MAPPING.unit[sourceKey];
    },
    getHeaderTextForSource ({ sourceKey = '', name = '' } = {}) {
      let prefix = '';
      if (sourceKey !== 'sp') {
        prefix = `${sourceKey.toUpperCase()}: `;
      }
      return `${prefix}${name}`;
    },
  },
};
</script>
