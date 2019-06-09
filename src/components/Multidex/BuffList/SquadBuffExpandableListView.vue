<template>
  <buff-expandable-list-view
    :sources="squad.units"
    :getEffectsFromSource="getEffectsForSquadUnit"
    :titleTopOffset="topNavbarHeight"
    :inputFilterOptions="filterOptions"
    :getTextForSource="getTextForSourceInSquadUnit"
    @filteroptions="$f => filterOptions = $f"
  >
    <template
      slot="buffexpandablelist"
      slot-scope="{ sources, targetType, effectType, inputEffectMappingBySource, highlightedBuffIds, listKey }"
    >
      <squad-buff-expandable-list
        :key="listKey"
        :squad="squad"
        :targetType="targetType"
        :effectType="effectType"
        :inputEffectMappingByUnitEntry="inputEffectMappingBySource"
        :highlightedProcs="(squadBuffTypes.PROC === effectType && highlightedBuffIds) || []"
        :highlightedPassives="(squadBuffTypes.PASSIVE === effectType && highlightedBuffIds) || []"
        :getUnit="getUnit"
        :getItem="getItem"
        :getExtraSkill="getExtraSkill"
      />
    </template>
  </buff-expandable-list-view>
</template>

<script>
import { targetTypes, squadBuffTypes, SOURCE_PATH_TO_TEXT_MAPPING } from '@/modules/constants';
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
import BuffExpandableListView from '@/components/Multidex/BuffList/GenericBuffExpandableList/BuffExpandableListView';
import SquadBuffExpandableList from '@/components/Multidex/BuffList/SquadBuffExpandableList';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    topNavbarHeight: {
      type: Number,
      default: 56,
    },
  },
  components: {
    SquadBuffExpandableList,
    BuffExpandableListView,
  },
  computed: {
    squadBuffTypes: () => squadBuffTypes,
    possibleTables: () => Object.freeze([
      {
        name: 'Party Passives',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Party Buffs',
        targetType: targetTypes.PARTY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'For the Enemy',
        targetType: targetTypes.ENEMY,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'Self Passives',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Self Buffs',
        targetType: targetTypes.SELF,
        effectType: squadBuffTypes.PROC,
      },
      {
        name: 'Other Passives',
        targetType: targetTypes.OTHER,
        effectType: squadBuffTypes.PASSIVE,
      },
      {
        name: 'Other Buffs',
        targetType: targetTypes.OTHER,
        effectType: squadBuffTypes.PROC,
      },
    ]),
    effectMappingByTable () {
      const allProcIds = new Set();
      const allPassiveIds = new Set();
      const tableMapping = new Map();
      const { squad } = this;
      const unitEntries = squad.units;
      this.possibleTables.forEach(({ targetType, effectType }) => {
        const effectMappingByUnit = new WeakMap();
        unitEntries.forEach(entry => {
          const effects = getEffectsListForSquadUnitEntry({
            unitEntry: entry,
            target: targetType,
            effectType,
            squad,
          }, this);
          effects.forEach(effect => {
            if (effectType === squadBuffTypes.PROC) {
              allProcIds.add(getEffectId(effect));
            } else if (effectType === squadBuffTypes.PASSIVE) {
              allPassiveIds.add(getEffectId(effect));
            }
          });
          effectMappingByUnit.set(entry, effects);
        });
        tableMapping.set(this.getTableKey(targetType, effectType), effectMappingByUnit);
      });

      tableMapping.set('allProcs', Array.from(allProcIds).sort((a, b) => +a - +b));
      tableMapping.set('allPassives', Array.from(allPassiveIds).sort((a, b) => +a - +b));
      return tableMapping;
    },
  },
  data () {
    return {
      filterOptions: {
        procs: [],
        passives: [],
      },
    };
  },
  created () {
    if (this.squad.filterOptions) {
      this.filterOptions.procs = Array.isArray(this.squad.filterOptions.procs)
        ? this.squad.filterOptions.procs.slice()
        : [];

      this.filterOptions.passives = Array.isArray(this.squad.filterOptions.passives)
        ? this.squad.filterOptions.passives.slice()
        : [];
    }
  },
  methods: {
    getTableKey (targetType, effectType) {
      return `${targetType}-${effectType}`;
    },
    getEffectsForSquadUnit (unit, targetType, effectType) {
      const table = this.effectMappingByTable.get(this.getTableKey(targetType, effectType));
      const effects = table.get(unit);
      return Array.isArray(effects) ? effects : [];
    },
    getTextForSourceInSquadUnit (path, source) {
      let displayValue = SOURCE_PATH_TO_TEXT_MAPPING[path];
      if (!displayValue) {
        if (path === 'es') {
          displayValue = `Elgif: ${this.getExtraSkill(source.es).name || source.es || path}`;
        } else if (path.startsWith('sphere:')) {
          const sphereId = path.split(':')[1];
          displayValue = `Sphere: ${this.getItem(sphereId).name || sphereId || path}`;
        }
      }
      return displayValue || path;
    },
  },
  watch: {
    filterOptions (newOptions) {
      this.squad.filterOptions = newOptions;
    },
  },
};
</script>


<style lang="less">
.squad-buff-expandable-list-view {
  .order-configuration-panel {
    .v-expansion-panel__header {
      padding-left: 8px;
      padding-right: 8px;
      font-weight: bold;
    }
  }
  dl {
    width: 100%;

    > dt {
      position: sticky;
      background: var(--background-color);
      z-index: 2;
      padding: 0.75em 0.25em;
      margin: 0 -0.25em;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  }

  dd {
    // width: 100%;
    overflow-x: auto;
  }
}
</style>
