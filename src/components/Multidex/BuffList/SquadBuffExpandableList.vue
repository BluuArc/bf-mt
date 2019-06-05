<template>
  <section class="squad-buff-expandable-list">
    <loading-indicator :progress="loadProgress" v-if="isVisuallyLoadingList" loadingMessage="Loading list..."/>
    <div v-if="!isVisuallyLoadingList && sortedEffectIds.length === 0" class="my-2">
      No entries of type [{{ effectType }}] targeting [{{ targetType }}].
    </div>
    <delayed-v-for-expansion-panel
      v-show="!isVisuallyLoadingList"
      @start="handleLoadStart"
      @end="handleLoadEnd"
      @progress="$p => loadProgress = $p"
      :entries="sortedEffectIds"
      v-model="expandedTables"
      expand
      focusable>
      <template slot="header" slot-scope="{ arrayEntry }">
        <div
          :class="{
            'expandable-list-entry--header': true,
            'highlighted-header': isHighlightedHeader(arrayEntry),
          }"
        >
          <span class="expandable-list-entry--title subheading" v-text="`${arrayEntry}: ${effectNameById[arrayEntry] }`"/>
          <div class="expandable-list-entry--columns-preview">
            <div
              class="expandable-list-entry--columns-preview-entry"
              v-for="(unitEntry) in getSquadEntriesForEffectId(arrayEntry)"
              :key="`${unitEntry.id}-${unitEntry.position}`"
            >
              <v-layout align-content-center row>
                <unit-thumbnail
                  class="unit-thumbnail"
                  :src="getImageUrls(unitEntry.id).ills_battle"
                  :rarity="getUnit(unitEntry.id).rarity"
                  :imageTitle="getUnit(unitEntry.id).name"
                  :displayWidth="thumbnailSize" :displayHeight="thumbnailSize">
                  <template slot="after-image">
                    <text
                      :x="0"
                      :y="thumbnailSize">
                      {{ !isNaN(unitEntry.bbOrder) ? unitEntry.bbOrder : '-' }}
                    </text>
                  </template>
                </unit-thumbnail>
              </v-layout>
              <v-flex text-xs-center>
                <span class="caption text-no-wrap">{{ unitEntry.position }}</span>
              </v-flex>
            </div>
          </div>
        </div>
      </template>
      <template slot-scope="{ arrayEntry, index }">
        <template v-if="viewedTables[index]">
          <value-subgrid
            v-show="expandedTables[index]"
            :properties="propsById[arrayEntry]"
            :values="getSquadEntriesForEffectId(arrayEntry).map(u => getValueSubgridEntry(u, arrayEntry))"
            :getUnit="getUnit"
            :getItem="getItem"
            :getExtraSkill="getExtraSkill"
            :allowOverflow="true"
            :minValueColumnWidth="'300px'"
          >
            <template slot="value-header" slot-scope="{ entry }">
              <v-layout row style="max-width: 500px; width: 100%; min-width: 300px;">
                <unit-entry
                  xs12
                  :index="squad.units.indexOf(entry.identifier)"
                  :unit="entry.identifier"
                  :getUnit="getUnit"
                  :getItem="getItem"
                  :getExtraSkill="getExtraSkill"
                  :isLead="squad.units.indexOf(entry.identifier) === squad.lead"
                  :isFriend="squad.units.indexOf(entry.identifier) === squad.friend"
                  class="d-flex py-1"
                  style="align-items: center; border: 1px solid var(--background-color-alt);"/>
              </v-layout>
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
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import { getEffectName } from '@/modules/core/buffs';
import { weightedStringSort } from '@/modules/utils';
import { mapGetters } from 'vuex';
import { squadBuffTypes } from '@/modules/constants';
import { Logger } from '@/modules/Logger';
import ValueSubgrid from '@/components/Multidex/BuffTableGrid/ValueSubgrid';
import UnitEntry from '@/components/Tools/Squads/SquadUnitEntry';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import DelayedVForExpansionPanel from './DelayedVForExpansionPanel';
import LoadingIndicator from '@/components/LoadingIndicator';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

const logger = new Logger({ prefix: '[SquadBuffExpandableList]' });
export default {
  mixins: [GettersMixin],
  props: {
    squad: {
      type: Object,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    effectType: {
      type: String,
      required: true,
    },
    effectMappingByUnitEntry: {
      type: WeakMap,
      default: () => new WeakMap(),
    },
    highlightedProcs: {
      type: Array,
      default: () => [],
    },
    highlightedPassives: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    ValueSubgrid,
    UnitThumbnail,
    UnitEntry,
    DelayedVForExpansionPanel,
    LoadingIndicator,
  },
  computed: {
    blacklistedKeys: () => [
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
    ],
    ...mapGetters('units', {
      getImageUrls: 'getImageUrls',
    }),
    thumbnailSize () {
      return 48;
    },
    unitEntries () {
      return this.squad.units;
    },
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
        'triggeredOn',
        'sourcePath',
      ],
    }),
    // assumption: 1 type of effect (passive or proc)
    effectsById () {
      // mapping in order of unit entries keyed by effect id
      const mapping = this.unitEntries.reduce((acc, entry) => {
        const effects = this.effectMappingByUnitEntry.get(entry) || getEffectsListForSquadUnitEntry({
          unitEntry: entry,
          target: this.targetType,
          effectType: this.effectType,
          squad: this.squad,
        }, this);
        effects.forEach(effect => {
          const effectDetails = this.getEffectDetails(effect);
          effectDetails.source = entry;

          if (!acc[effectDetails.id]) {
            acc[effectDetails.id] = [];
          }
          acc[effectDetails.id].push(effectDetails);
        });
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    propsById () {
      // given an ID, return an array of property names
      const mapping = Object.keys(this.effectsById).reduce((acc, key) => {
        const props = new Set();

        const effects = this.effectsById[key];
        effects.forEach(effectEntry => {
          Object.keys(effectEntry.effect).forEach(prop => {
            props.add(prop);
          });
        });
        const sortOptions = this.weightedCompareOptions;
        acc[key] = Object.freeze(Array.from(props).sort((a, b) => {
          return weightedStringSort(a, b, sortOptions);
        }));
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    sortedEffectIds () {
      return Object.keys(this.effectsById).sort((a, b) => +a - +b);
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
      loadEndToken: 0,
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
    getEffectDetails (effect) {
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect)
        .filter(key => !this.blacklistedKeys.includes(key)) // get everything but the blacklisted keys
        .forEach(key => {
          filteredEffect[key] = effect[key];
        });
      return { id, effect: filteredEffect };
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
    getSquadEntriesForEffectId (id) {
      if (!this.effectsById[id]) {
        logger.warn(`Missing effect id array [${id}]`, this.effectsById);
      }
      return Array.from(new Set((this.effectsById[id] || []).map(e => e.source)));
    },
    isHighlightedHeader (id) {
      let isHighlighted = false;
      if (this.effectType === squadBuffTypes.PROC) {
        isHighlighted = this.highlightedProcs.includes(id);
      } else if (this.effectType === squadBuffTypes.PASSIVE) {
        isHighlighted = this.highlightedPassives.includes(id);
      }
      return isHighlighted;
    },
    highlightHeaders () {
      const allHighlightedHeaders = Array.from(this.$el.querySelectorAll('.highlighted-header'));
      const isLightMode = !!this.$store.state.settings.lightMode;
      const classesToAdd = ['blue', isLightMode ? 'lighten-4' : 'darken-4', 'is-highlighted'];
      allHighlightedHeaders.forEach(header => {
        const expansionPanelWrapper = header.parentNode;
        expansionPanelWrapper.classList.add(...classesToAdd);
      });
    },
    ensureHeadersAreHighlighted () {
      if (!this.highlightCheckerTimeout) {
        const runCheck = () => {
          const hasUnhighlightedHeader = !!this.$el.querySelector('.highlighted-header:not(.is-highlighted)');
          if (hasUnhighlightedHeader && !this.isVisuallyLoadingList) {
            this.highlightHeaders();
            this.highlightCheckerTimeout = setTimeout(runCheck, 1000);
          } else {
            this.highlightCheckerTimeout = null;
          }
        };
        runCheck();
      }
    },
  },
  watch: {
    expandedTables (newValue) {
      newValue.forEach((doShow, index) => {
        if (doShow) {
          this.viewedTables[index] = true;
        }
      });
    },
    loadingList () {
      if (!this.loadingDebouncer) {
        this.loadingDebouncer = new LoadingDebouncer(val => {
          this.isVisuallyLoadingList = val;
        });
      }
      this.loadingDebouncer.setValue(() => this.loadingList);
    },
    async isVisuallyLoadingList (isLoading) {
      if (!isLoading) {
        await this.$nextTick();
        this.ensureHeadersAreHighlighted();
      }
    },
  },
};
</script>

<style lang="less">
.squad-buff-expandable-list {
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
    // flex: none;
    word-break: break-word;
  }

  .expandable-list-entry--columns-preview {
    display: flex;
    // width: 100%;
    margin-left: 1em;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .expandable-list-entry--columns-preview-entry {
    margin: 0 0.5em;
    min-width: 70px;
    image.lazy-actual {
      min-width: 48px;
    }

    .unit-thumbnail {
      flex: 0 1 auto;
      margin: auto;
      font: bold 4.5em sans-serif;
      stroke: black;
      stroke-width: 2px;
      fill: white;
    }
  }
}
</style>
