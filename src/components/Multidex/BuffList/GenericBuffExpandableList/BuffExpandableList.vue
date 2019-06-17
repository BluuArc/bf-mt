<template>
  <section class="buff-expandable-list">
    <loading-indicator
      v-if="isVisuallyLoadingList"
      :progress="loadProgress"
      loadingMessage="Loading list..."
    />
    <div v-if="!isVisuallyLoadingList && sortedEffectIds.length === 0" class="my-2">
      <slot name="noentries">
        <span>No entries of type [{{ effectType }}] were found.</span>
      </slot>
    </div>
    <delayed-v-for-expansion-panel
      v-show="!isVisuallyLoadingList"
      v-model="expandedTables"
      @start="handleLoadStart"
      @end="handleLoadEnd"
      @progress="$p => loadProgress = $p"
      :entries="sortedEffectIds"
      expand focusable
    >
      <template slot="header" slot-scope="{ arrayEntry }">
        <div :class="getEntryHeaderClasses(arrayEntry)">
          <span class="expandable-list-entry--title subheading" v-text="`${arrayEntry}: ${effectNameById[arrayEntry] }`"/>
          <slot
            name="allentrypreview"
            :entries="getSourcesForEffectId(arrayEntry)"
            :effectId="arrayEntry"
          >
            <div v-for="(entry, i) in getSourcesForEffectId(arrayEntry)" :key="i">
              {{ entry }}
            </div>
          </slot>
        </div>
      </template>
      <template slot-scope="{ arrayEntry, index }">
        <template v-if="viewedTables[index]">
          <value-subgrid
            v-show="expandedTables[index]"
            :properties="propsById[arrayEntry]"
            :values="getSourcesForEffectId(arrayEntry).map(e => getValueSubgridEntry(e.source, arrayEntry))"
            :allowOverflow="true"
            :minValueColumnWidth="'300px'"
            :getTextForSource="getTextForSource"
          >
            <template slot="value-header" slot-scope="{ entry }">
              <slot name="value-header" :entry="entry.identifier">
                <span>{{ entry.identifier }}</span>
              </slot>
            </template>
          </value-subgrid>
        </template>
      </template>
    </delayed-v-for-expansion-panel>
  </section>
</template>

<script>
import LoadingDebouncer from '@/modules/LoadingDebouncer';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { getEffectName, handleUnknownParams } from '@/modules/core/buffs';
import { weightedStringSort } from '@/modules/utils';
import { Logger } from '@/modules/Logger';
import ValueSubgrid from './ValueSubgrid';
import DelayedVForExpansionPanel from '@/components/Multidex/BuffList/DelayedVForExpansionPanel';
import LoadingIndicator from '@/components/LoadingIndicator';

const logger = new Logger({ prefix: '[BuffExpandableList]' });
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
    inputEffectMappingBySource: {
      type: WeakMap,
      default: () => new WeakMap(),
    },
    highlightedBuffIds: {
      type: Array,
      default: () => [],
    },
    effectType: {
      type: String,
      required: true,
    },
    getTextForSource: {
      type: Function,
      // eslint-disable-next-line no-unused-vars
      default: (path, source) => path,
    },
  },
  components: {
    ValueSubgrid,
    DelayedVForExpansionPanel,
    LoadingIndicator,
  },
  computed: {
    blacklistedKeys: () => Object.freeze([
      'passive id',
      'unknown passive id',
      'proc id',
      'unknown proc id',
      'add to bb',
      'add to sbb',
      'add to ubb',
      'trigger on bb',
      'trigger on sbb',
      'trigger on ubb',
    ]),
    weightedCompareOptions: () => Object.freeze({
      beginning: [
        'conditions',
        'esConditions',
        'effect delay time(ms)/frame',
      ],
      end: [
        'passive target',
        'target area',
        'target type',
        'buff turns',
        'sp_type',
        'sourceSpCode',
        'triggeredOn',
        'sourcePath',
      ],
    }),
    // assumption: all effects are of the same type (passive, proc, etc)
    effectsById () {
      const { getEffectsFromSource, getEffectDetails, inputEffectMappingBySource } = this;
      const mapping = this.sources.reduce((acc, entry) => {
        const effects = inputEffectMappingBySource.get(entry) || getEffectsFromSource(entry);
        effects.forEach(effect => {
          const effectDetails = getEffectDetails(effect);
          effectDetails.source = entry;
          if (!acc[effectDetails.id]) {
            acc[effectDetails.id] = [];
          }
          acc[effectDetails.id].push(Object.freeze(effectDetails));
        });
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    propsById () {
      const { effectsById, weightedCompareOptions } = this;
      const mapping = Object.keys(effectsById).reduce((acc, key) => {
        const props = new Set();

        const effects = effectsById[key];
        effects.forEach(effectEntry => {
          Object.keys(effectEntry.effect).forEach(prop => {
            props.add(prop);
          });
        });
        acc[key] = Object.freeze(Array.from(props).sort((a, b) => weightedStringSort(a, b, weightedCompareOptions)));
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    sortedEffectIds () {
      return Object.freeze(Object.keys(this.effectsById).sort((a, b) => +a - +b));
    },
    effectNameById () {
      const idKey = `${this.effectType} id`;
      const mapping = this.sortedEffectIds.reduce((acc, id) => {
        acc[id] = getEffectName({ [idKey]: id });
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
  },
  data () {
    return {
      expandedTables: [],
      viewedTables: {},
      valueSubgridEntryByEntryByEffectId: {},
      loadStartToken: 0,
      loadingList: true,
      isVisuallyLoadingList: true,
      loadingDebouncer: null,
      highlightCheckerTimeout: null,
      loadProgress: -1,
    };
  },
  beforeDestroy () {
    if (this.loadingDebouncer) {
      this.loadingDebouncer.dispose();
    }
  },
  methods: {
    getEffectDetails (effect) {
      const id = getEffectId(effect);
      const filteredEffect = {};
      const processedEffect = handleUnknownParams(effect);
      Object.keys(processedEffect)
        .filter(key => !this.blacklistedKeys.includes(key)) // get everything but the blacklisted keys
        .forEach(key => {
          filteredEffect[key] = processedEffect[key];
        });
      return { id, effect: filteredEffect };
    },
    handleLoadStart (startToken) {
      this.loadStartToken = startToken;
      this.loadingList = true;
      this.loadProgress = -1;
    },
    handleLoadEnd (endToken) {
      if (this.loadStartToken === endToken) {
        this.loadingList = false;
      }
    },
    getValueSubgridEntry (entry, effectId) {
      if (!this.valueSubgridEntryByEntryByEffectId[effectId]) {
        this.valueSubgridEntryByEntryByEffectId[effectId] = new WeakMap();
      }
      const valueSubgridCache = this.valueSubgridEntryByEntryByEffectId[effectId];
      if (!valueSubgridCache.has(entry)) {
        const subgridEntry = {
          identifier: entry,
          values: this.effectsById[effectId]
            .filter(effect => effect.source === entry)
            .map(e => e.effect),
        };
        valueSubgridCache.set(entry, subgridEntry);
      }
      return valueSubgridCache.get(entry);
    },
    toggleEffectView (i) {
      this.expandedTables[i] = !this.expandedTables[i];
    },
    toggleAllEffectViews () {
      if (this.expandedTables.length === this.sortedEffectIds.length) {
        this.expandedTables = [];
      } else {
        this.expandedTables = this.sortedEffectIds.map((val, i) => i);
      }
    },
    isEmptyArray (obj) {
      return Array.isArray(obj) && obj.length === 0;
    },
    getSourcesForEffectId (id) {
      const effectList = this.effectsById[id];
      const sourcePathsBySource = new Map();
      if (!effectList) {
        logger.warn(`Missing effect id array [${id}]`, this.effectsById);
      }
      (effectList || []).forEach(entry => {
        const sourcePaths = sourcePathsBySource.get(entry.source) || new Set();
        sourcePaths.add(entry.effect.sourcePath);
        sourcePathsBySource.set(entry.source, sourcePaths);
      });
      return Array.from(sourcePathsBySource.entries()).map(([source, sourcePaths]) => ({ source, sourcePaths: Array.from(sourcePaths) }));
    },
    isHighlightedHeader (id) {
      return this.highlightedBuffIds.includes(id);
    },
    highlightHeaders () {
      const allHighlightedHeaders = Array.from(this.$el.querySelectorAll('.highlighted-header'));
      const isLightMode = !!this.$store.state.settings.lightMode;
      const classesToAdd = ['blue', isLightMode ? 'lighten-4' : 'darken-4'];
      allHighlightedHeaders.forEach(header => {
        const expansionPanelWrapper = header.parentNode;
        expansionPanelWrapper.classList.add(...classesToAdd);
        header.classList.add('is-highlighted');
      });
    },
    ensureHeadersAreHighlighted () {
      if (!this.highlightCheckerTimeout) {
        let noActionNecessaryCount = 0;
        const runCheck = () => {
          const hasUnhighlightedHeader = !!this.$el.querySelector('.highlighted-header:not(.is-highlighted)');
          if (hasUnhighlightedHeader && !this.isVisuallyLoadingList) {
            noActionNecessaryCount = 0;
            this.highlightHeaders();
            this.highlightCheckerTimeout = setTimeout(runCheck, 1000);
          } else if (noActionNecessaryCount < 3) {
            noActionNecessaryCount++;
            this.highlightCheckerTimeout = setTimeout(runCheck, 1000);
          } else {
            this.highlightCheckerTimeout = null;
          }
        };
        runCheck();
      }
    },
    getEntryHeaderClasses (effectId) {
      return {
        'expandable-list-entry--header': true,
        'highlighted-header': this.isHighlightedHeader(effectId),
      };
    },
  },
  watch: {
    expandedTables (newValue) {
      newValue.forEach((doShow, index) => {
        if (doShow && this.viewedTables[index] !== true) {
          this.viewedTables[index] = true;
        }
      });
    },
    loadingList (isLoading) {
      if (!this.loadingDebouncer) {
        this.loadingDebouncer = new LoadingDebouncer(val => {
          this.isVisuallyLoadingList = val;
        });
      }
      this.loadingDebouncer.setValue(() => this.loadingList);
      this.$emit('loadstatechange', isLoading);
    },
    isVisuallyLoadingList (isLoading) {
      if (!isLoading) {
        this.ensureHeadersAreHighlighted();
      }
    },
  },
};
</script>

<style lang="less">
.buff-expandable-list {
  .loading-indicator {
    margin: 2em 0;
  }

  .v-expansion-panel__header {
    padding-left: 8px;
    padding-right: 8px;
  }

  .v-expansion-panel__body {
    background-color: inherit;
  }

  .expandable-list-entry--header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .expandable-list-entry--title {
    font-weight: bold;
    word-break: break-word;
  }

  .expandable-list-entry--columns-preview {
    display: flex;
    margin-left: 1em;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
}
</style>
