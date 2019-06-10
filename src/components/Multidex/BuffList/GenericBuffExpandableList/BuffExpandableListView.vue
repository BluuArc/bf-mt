<template>
  <div class="buff-expandable-list-view">
    <v-expansion-panel class="order-configuration-panel">
      <v-expansion-panel-content>
        <div slot="header">
          Configure Buff List View
        </div>
        <section>
          <v-layout row justify-center align-center class="pl-2">
            <v-flex style="flex: none">
              View Mode
            </v-flex>
            <v-flex class="text-xs-center">
              <v-btn
                flat
                :outline="viewMode === TARGET_VIEW_TYPE"
                @click="emitNewViewMode(TARGET_VIEW_TYPE)"
              >
                Target
              </v-btn>
            </v-flex>
            <v-flex class="text-xs-center">
              <v-btn
                flat
                :outline="viewMode === OVERVIEW_VIEW_TYPE"
                @click="emitNewViewMode(OVERVIEW_VIEW_TYPE)"
              >
                Overview
              </v-btn>
            </v-flex>
          </v-layout>
          <order-configurator
            v-show="viewMode === 'target'"
            v-model="buffTables"
            :getEntryName="(configIndex) => possibleTables[configIndex].name"
            :fullValueSet="defaultBuffTables"
          />
          <section>
            <v-btn flat @click="buffTables = buffTables.concat(defaultBuffTables.filter((_, i) => !buffTables.includes(i)))">Show All</v-btn>
            <v-btn flat @click="buffTables = []">Hide All</v-btn>
            <v-btn flat @click="buffTables = defaultBuffTables.slice()">Reset to Default</v-btn>
          </section>
        </section>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <section class="buff-configuration-area my-2">
      <proc-selector
        :showSelector="activeSelector === 'procs'"
        @toggleview="$show => activeSelector = $show ? 'procs' : ''"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <passive-selector
        :showSelector="activeSelector === 'passives'"
        @toggleview="$show => activeSelector = $show ? 'passives' : ''"
        v-model="filterOptions"
        :filterHelper="filterHelper"
      />
      <div class="px-2" style="font-weight: bold;">Buff Highlighting</div>
      <template v-if="hasPassives || hasProcs">
        <v-layout row wrap>
          <v-flex
            v-if="hasProcs"
            xs12 :md6="hasPassives"
            @click="activeSelector = 'procs'"
            style="cursor: pointer;"
          >
            <v-combobox
              :value="filterOptions.procs"
              class="mx-2"
              disabled
              label="Highlight Active Buffs"
              hint="Empty selection is equivalent to showing all."
              multiple
              persistent-hint/>
          </v-flex>
          <v-flex
            v-if="hasPassives"
            xs12 :md6="hasProcs"
            @click="activeSelector = 'passives'"
            style="cursor: pointer;"
          >
            <v-combobox
              :value="filterOptions.passives"
              class="mx-2"
              disabled
              label="Highlight Passive Buffs"
              hint="Empty selection is equivalent to showing all."
              multiple
              persistent-hint/>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex v-if="hasProcs" xs12 :md6="hasPassives">
            <v-alert
              class="mx-2"
              :value="true"
              :type="(missingProcs.length > 0 && 'warning') || 'info'"
            >
              <template v-if="missingProcs.length > 0">
                <p>The following active buffs are missing from the current squad.</p>
                <ul>
                  <li
                    v-for="proc in missingProcs"
                    :key="proc"
                    v-text="getEffectNameForIdAndType(proc, 'proc')"
                  />
                </ul>
              </template>
              <span v-else-if="filterOptions.procs.length > 0">All specified active buffs are present.</span>
              <span v-else>No filters for active buffs specified.</span>
            </v-alert>
          </v-flex>
          <v-flex v-if="hasPassives" xs12 :md6="hasProcs">
            <v-alert
              class="mx-2"
              :value="true"
              :type="(missingPassives.length > 0 && 'warning') || 'info'"
            >
              <template v-if="missingPassives.length > 0">
                <p>The following passive buffs are missing from the current squad.</p>
                <ul>
                  <li
                    v-for="passive in missingPassives"
                    :key="passive"
                    v-text="getEffectNameForIdAndType(passive, 'passive')"
                  />
                </ul>
              </template>
              <span v-else-if="filterOptions.passives.length > 0">All specified passive buffs are present.</span>
              <span v-else>No filters for passive buffs specified.</span>
            </v-alert>
          </v-flex>
        </v-layout>
      </template>
    </section>
    <dl>
      <template v-if="viewMode === TARGET_VIEW_TYPE">
        <template v-for="tableConfigIndex in buffTables">
          <dt
            class="title"
            :style="buffListTitleStyle"
            :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-title`"
            v-text="possibleTables[tableConfigIndex].name"
          />
          <dd :key="`${possibleTables[tableConfigIndex].targetType}-${possibleTables[tableConfigIndex].effectType}-table`">
            <slot
              name="buffexpandablelist"
              :sources="sources"
              :targetType="possibleTables[tableConfigIndex].targetType"
              :effectType="possibleTables[tableConfigIndex].effectType"
              :inputEffectMappingBySource="effectMappingByTable.get(getTableKey(possibleTables[tableConfigIndex].targetType, possibleTables[tableConfigIndex].effectType))"
              :highlightedBuffIds="getHighlightedBuffListForTable(possibleTables[tableConfigIndex].effectType)"
              :getTextForSource="getTextForSource"
              :listKey="getEffectTypeKey(possibleTables[tableConfigIndex].effectType)"
            >
              <buff-expandable-list
                :key="getEffectTypeKey(possibleTables[tableConfigIndex].effectType)"
                :sources="sources"
                :effectType="possibleTables[tableConfigIndex].effectType"
                :inputEffectMappingBySource="effectMappingByTable.get(getTableKey(possibleTables[tableConfigIndex].targetType, possibleTables[tableConfigIndex].effectType))"
                :highlightedBuffIds="getHighlightedBuffListForTable(possibleTables[tableConfigIndex].effectType)"
                :getTextForSource="getTextForSource"
              >
                <template slot="noentries">
                  <slot
                    name="noentries"
                    :effectType="possibleTables[tableConfigIndex].effectType"
                    :targetType="possibleTables[tableConfigIndex].targetType"
                  >
                    <span>No entries of type [{{ possibleTables[tableConfigIndex].effectType }}] were found.</span>
                  </slot>
                </template>
                <template slot="allentrypreview" slot-scope="{ entries, effectId }">
                  <slot
                    name="allentrypreview"
                    :entries="entries"
                    :effectId="effectId"
                    :effectType="possibleTables[tableConfigIndex].effectType"
                    :targetType="possibleTables[tableConfigIndex].targetType"
                  >
                    <div v-for="(source, i) in entries" :key="i">
                      {{ source }}
                    </div>
                  </slot>
                </template>
                <template slot="value-header" slot-scope="{ entry }">
                  <slot name="value-header" :entry="entry">
                    <span>{{ entry }}</span>
                  </slot>
                </template>
              </buff-expandable-list>
            </slot>
          </dd>
        </template>
      </template>
      <template v-else-if="viewMode === OVERVIEW_VIEW_TYPE">
        <template v-for="tableConfig in overviewTables">
          <dt
            class="title"
            :style="buffListTitleStyle"
            :key="`${tableConfig.mappingKey}-${tableConfig.effectType}-title`"
            v-text="tableConfig.name"
          />
          <dd :key="`${tableConfig.mappingKey}-${tableConfig.effectType}-table`">
            <slot
              name="buffexpandablelist"
              :sources="sources"
              :targetType="tableConfig.mappingKey"
              :effectType="tableConfig.effectType"
              :inputEffectMappingBySource="effectMappingByTable.get(tableConfig.mappingKey)"
              :highlightedBuffIds="getHighlightedBuffListForTable(tableConfig.effectType)"
              :getTextForSource="getTextForSource"
              :listKey="getEffectTypeKey(tableConfig.effectType)"
            >
              <buff-expandable-list
                :key="getEffectTypeKey(tableConfig.effectType)"
                :sources="sources"
                :effectType="tableConfig.effectType"
                :inputEffectMappingBySource="effectMappingByTable.get(tableConfig.mappingKey)"
                :highlightedBuffIds="getHighlightedBuffListForTable(tableConfig.effectType)"
                :getTextForSource="getTextForSource"
              >
                <template slot="noentries">
                  <slot
                    name="noentries"
                    :effectType="tableConfig.effectType"
                    :targetType="tableConfig.mappingKey"
                  >
                    <span>No entries of type [{{ tableConfig.effectType }}] were found.</span>
                  </slot>
                </template>
                <template slot="allentrypreview" slot-scope="{ entries, effectId }">
                  <slot
                    name="allentrypreview"
                    :entries="entries"
                    :effectId="effectId"
                    :effectType="tableConfig.effectType"
                    :targetType="tableConfig.mappingKey"
                  >
                    <div v-for="(source, i) in entries" :key="i">
                      {{ source }}
                    </div>
                  </slot>
                </template>
                <template slot="value-header" slot-scope="{ entry }">
                  <slot name="value-header" :entry="entry">
                    <span>{{ entry }}</span>
                  </slot>
                </template>
              </buff-expandable-list>
            </slot>
          </dd>
        </template>
      </template>
      <template v-else>
        Unknown view mode [{{ viewMode }}]
      </template>
    </dl>
  </div>
</template>

<script>
import { targetTypes, squadBuffTypes } from '@/modules/constants';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { getEffectName } from '@/modules/core/buffs';
import FilterOptionsHelper from '@/modules/FilterOptionsHelper';
import OrderConfigurator from '@/components/OrderConfigurator';
import ProcSelector from '@/components/Multidex/Filters/BuffSelector/ProcSelector';
import PassiveSelector from '@/components/Multidex/Filters/BuffSelector/PassiveSelector';
import BuffExpandableList from './BuffExpandableList.vue';

const TARGET_VIEW_TYPE = 'target';
const OVERVIEW_VIEW_TYPE = 'overview';
const POSSIBLE_VIEW_TYPES = Object.freeze([TARGET_VIEW_TYPE, OVERVIEW_VIEW_TYPE]);

export default {
 props: {
    sources: {
      type: Array,
      required: true,
    },
    getEffectsFromSource: {
      type: Function,
      default: () => [],
    },
    getTextForSource: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: (path, source) => path,
    },
    titleTopOffset: {
      type: Number,
      default: 56,
    },
    hasPassives: {
      type: Boolean,
      default: true,
    },
    hasProcs: {
      type: Boolean,
      default: true,
    },
    inputFilterOptions: {
      required: false,
    },
    viewMode: {
      type: String,
      default: POSSIBLE_VIEW_TYPES[0],
    },
 },
 components: {
    BuffExpandableList,
    OrderConfigurator,
    ProcSelector,
    PassiveSelector,
 },
 computed: {
   TARGET_VIEW_TYPE: () => TARGET_VIEW_TYPE,
   OVERVIEW_VIEW_TYPE: () => OVERVIEW_VIEW_TYPE,
   buffListTitleStyle () {
     return {
       top: `${this.titleTopOffset}px`,
     };
   },
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
    overviewTables: () => Object.freeze([
      {
        name: 'All Passive Buffs',
        effectType: squadBuffTypes.PASSIVE,
        mappingKey: 'allPassivesMapping',
      },
      {
        name: 'All Active Buffs',
        effectType: squadBuffTypes.PROC,
        mappingKey: 'allProcsMapping',
      },
    ]),
    defaultBuffTables () {
      return Object.freeze(this.possibleTables.map((_, i) => i));
    },
    effectMappingByTable () {
      const allProcIds = new Set();
      const allPassiveIds = new Set();
      const tableMapping = new Map();
      const { sources, possibleTables, getEffectsFromSource, getTableKey } = this;

      const allProcsBySource = new WeakMap();
      const allPassivesBySource = new WeakMap();
      possibleTables.forEach(({ targetType, effectType }) => {
        const effectMappingBySource = new WeakMap();
        sources.forEach(entry => {
          const effects = getEffectsFromSource(entry, targetType, effectType);
          const currentProcAggregate = allProcsBySource.get(entry) || [];
          const currentPassiveAggregate = allPassivesBySource.get(entry) || [];
          effects.forEach(effect => {
            if (effectType === squadBuffTypes.PROC) {
              allProcIds.add(getEffectId(effect));
              currentProcAggregate.push(effect);
            } else if (effectType === squadBuffTypes.PASSIVE) {
              allPassiveIds.add(getEffectId(effect));
              currentPassiveAggregate.push(effect);
            }
          });
          effectMappingBySource.set(entry, effects);
          allProcsBySource.set(entry, currentProcAggregate);
          allPassivesBySource.set(entry, currentPassiveAggregate);
        });
        tableMapping.set(getTableKey(targetType, effectType), effectMappingBySource);
      });

      tableMapping.set('allProcs', Array.from(allProcIds).sort((a, b) => +a - +b));
      tableMapping.set('allPassives', Array.from(allPassiveIds).sort((a, b) => +a - +b));
      tableMapping.set('allProcsMapping', allProcsBySource);
      tableMapping.set('allPassivesMapping', allPassivesBySource);
      return tableMapping;
    },
    missingProcs () {
      const allProcs = this.effectMappingByTable.get('allProcs');
      const { procs } = this.filterOptions;
      return procs.filter(id => !allProcs.includes(id));
    },
    missingPassives () {
      const allPassives = this.effectMappingByTable.get('allPassives');
      const { passives } = this.filterOptions;
      return passives.filter(id => !allPassives.includes(id));
    },
    hasBuffFilters () {
      return (this.hasProcs && this.filterOptions.procs.length > 0) ||
        (this.hasPassives && this.filterOptions.passives.length > 0);
    },
  },
  data () {
    return {
      buffTables: [],
      filterOptions: {
        procs: [],
        passives: [],
      },
      activeSelector: '',
      filterHelper: new FilterOptionsHelper(),
    };
  },
  created () {
    this.buffTables = this.defaultBuffTables.slice();
    if (typeof this.inputFilterOptions === 'object') {
      this.filterOptions.procs = Array.isArray(this.inputFilterOptions.procs)
        ? this.inputFilterOptions.procs.slice()
        : [];

      this.filterOptions.passives = Array.isArray(this.inputFilterOptions.passives)
        ? this.inputFilterOptions.passives.slice()
        : [];
    }
  },
  methods: {
    getTableKey (targetType, effectType) {
      return `${targetType}-${effectType}`;
    },
    getEffectTypeKey (effectType) {
      let key = '';
      if (effectType === squadBuffTypes.PROC) {
        key = this.filterOptions.procs.join('-');
      } else if (effectType === squadBuffTypes.PASSIVE) {
        key = this.filterOptions.passives.join('-');
      }
      return key;
    },
    getEffectNameForIdAndType (id, type) {
      let result;
      if (type === squadBuffTypes.PASSIVE) {
        result = getEffectName({ 'passive id': id });
      } else if (type === squadBuffTypes.PROC) {
        result = getEffectName({ 'proc id': id });
      }

      if (!result) {
        result = `Unknown buff`;
      }

      return `${result} [${id}]`;
    },
    getHighlightedBuffListForTable (effectType) {
      let list = [];
      if (effectType === squadBuffTypes.PASSIVE && this.hasPassives) {
        list = this.filterOptions.passives;
      } else if (effectType === squadBuffTypes.PROC && this.hasProcs) {
        list = this.filterOptions.procs;
      }
      return list;
    },
    emitNewViewMode (viewType = TARGET_VIEW_TYPE) {
      this.$emit('viewmode', viewType);
    },
  },
  watch: {
    activeSelector () {
      const { procs = [], passives = [] } = this.filterOptions;
      this.$emit('filteroptions', { procs, passives });
    },
    viewMode: {
      immediate: true,
      handler (newValue) {
        if (!POSSIBLE_VIEW_TYPES.includes(newValue)) {
          this.emitNewViewMode(POSSIBLE_VIEW_TYPES[0]);
        }
      },
    },
  },
};
</script>

<style lang="less">
.buff-expandable-list-view {
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
