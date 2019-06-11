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
        <div v-show="isShowing" style="overflow-x: visible;">
          <buff-expandable-list-view
            v-if="hasShown"
            :viewMode="viewMode"
            @viewmode="$v => viewMode = $v"
            :sources="buffSources"
            :getEffectsFromSource="getEffectsFromSource"
            :stickyTitles="false"
          >
            <span slot="allentrypreview" slot-scope="{ entries }">
              <span v-for="source in entries" :key="source.sourceKey">
                <v-chip
                  small
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
          </buff-expandable-list-view>
        </div>
      </v-slide-y-transition>
    </v-layout>
  </template>
  </description-card-base>
</template>

<script>
import { getEffectsListForUnit } from '@/modules/core/units';
import { MATERIAL_COLOR_MAPPING } from '@/modules/constants';
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import BuffExpandableListView from '@/components/Multidex/BuffList/GenericBuffExpandableList/BuffExpandableListView';

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
    BuffExpandableListView,
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
      viewMode: '',
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
