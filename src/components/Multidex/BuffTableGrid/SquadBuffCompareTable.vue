<template>
  <div class="squad-buff-compare-table-grid" :style="mainGridStyle">
    <!-- header row -->
    <span class="id-cell header-cell">
      <v-btn flat @click="toggleAllEffectViews" small style="min-height: 40px;">
        <v-icon>{{ hiddenIndices.length === sortedEffectIds.length ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
        ID
      </v-btn>
    </span>
    <span class="value-subgrid header-grid" :style="mainValueGridStyle">
      <span class="property-cell header-cell">
        Buff Property
      </span>
      <span
        v-for="entry in unitEntries" :key="`${entry.id}-${entry.position}`"
        :style="convertNumberToColumnSpanStyle(columnCountMappingByUnitEntry.get(entry))"
        class="value-cell header-cell">
          <slot name="value-header" :entry="entry">
            {{ entry.id }} / {{ entry.position }}
          </slot>
          <!-- <div>Clicking on column will collapse data for it</div> -->
      </span>
    </span>

    <!-- effect rows -->
    <template v-for="(effectId, i) in sortedEffectIds">
      <span class="id-cell" :key="`${effectId}-${i}-id`">
        <v-btn flat small class="collapse-btn" @click="() => toggleEffectView(i)">
          <span style="flex: 1 1 100%;">
            <v-icon>{{ hiddenIndices.includes(i) ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</v-icon>
          </span>
          <span style="flex: 1 1 100%;">
            <slot name="default">
              {{ effectId }}
            </slot>
          </span>
          <span style="flex: 1 1 100%;">
            <v-icon>{{ hiddenIndices.includes(i) ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
          </span>
        </v-btn>
      </span>
      <span  
        class="value-subgrid"
        :style="mainValueGridStyle"
        :key="`${effectId}-${i}-value-subgrid`"
      >
        <!-- add 1 to column span to account for property column -->
        <span
          v-if="hiddenIndices.includes(i)"
          class="property-cell"
          style="grid-column: span 2"
          v-text="getEffectsHiddenText(propsById[effectId].length)"
        />
        <template v-else>
          <template v-for="(prop, j) in propsById[effectId]">
            <span
              :class="{
                'property-cell': true,
                [j % 2 === 0 ? 'even-row' : 'odd-row']: true,
                'only-row': propsById[effectId].length === 1,
              }"
              :key="`${effectId}-${i}-${j}-property`"
            >
              <span v-text="prop"/>
            </span>
            <template v-for="(unitEntry, u) in unitEntries">
              <span
                v-if="getColumnDataForUnitEntry(unitEntry, effectId).length === 0"
                :key="`${u}-${i}-${j}-unit-empty`"
                class="value-cell is-last-value-cell"
                :style="convertNumberToColumnSpanStyle(columnCountMappingByUnitEntry.get(unitEntry))"
                v-text="'-'"
              />
              <template v-else>
                <span
                  v-for="(valueEntry, v) in getColumnDataForUnitEntry(unitEntry, effectId)"
                  :key="`${u}-${i}-${j}-${v}-unit`"
                  :style="convertNumberToColumnSpanStyle(valueEntry.columnSpan || 1)"
                  :class="{
                    'value-cell': true,
                    'is-last-value-cell': v === getColumnDataForUnitEntry(unitEntry, effectId).length - 1,
                  }"
                >
                  {{ valueEntry.effect[prop] || '-' }}
                </span>
              </template>
            </template>
          </template>
        </template>
      </span>
    </template>
  </div>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';
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
  },
  computed: {
    mainGridStyle () {
      const headerRowHeight = 'minmax(40px, auto)';
      const effectRowHeight = 'auto';
      return {
        'grid-template-rows': [
          headerRowHeight,
          `repeat(${this.sortedEffectIds.length}, ${effectRowHeight})`,
        ].join(' '),
      };
    },
    mainValueGridStyle () {
      const propertyColumnWidth = '17.5em';
      const valueSubgridWidth = 'minmax(5em, 1fr)';
      return {
        'grid-template-columns': [
          propertyColumnWidth,
          `repeat(${this.numValueColumns}, ${valueSubgridWidth})`,
        ].join(' '),
      };
    },
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
    unitEntries () {
      return this.squad.units;
    },
    // assumption: 1 type of effect (passive or proc)
    effectsById () {
      // mapping in order of unit entries keyed by effect id
      const mapping = this.unitEntries.reduce((acc, entry) => {
        const effects = getEffectsListForSquadUnitEntry({
          unitEntry: entry,
          target: this.targetType,
          effectType: this.effectType,
          squad: this.squad,
        }, this);
        effects.forEach(effect => {
          const effectDetails = this.getEffectDetails(effect);
          effectDetails.source = effect.source || entry;

          if (!acc[effectDetails.id]) {
            acc[effectDetails.id] = [];
          }
          acc[effectDetails.id].push(effectDetails);
        });
        return acc;
      }, {});
      // eslint-disable-next-line no-console
      console.warn({mapping});
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
        acc[key] = Object.freeze(Array.from(props).sort((a, b) => a < b ? -1 : 1));
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    sortedEffectIds () {
      return Object.keys(this.effectsById).sort((a, b) => +a - +b);
    },
    numValueColumns () {
      return this.unitEntries.reduce((acc, unit) => {
        return acc + this.columnCountMappingByUnitEntry.get(unit);
      }, 0);
    },
    columnCountMappingByUnitEntry () {
      const mapping = new WeakMap();
      const { sortedEffectIds, effectsById } = this;
      this.unitEntries.forEach(unit => {
        let currentColumnCount = 1;
        sortedEffectIds.forEach(id => {
          const numEffectsFromUnitForId = effectsById[id].filter(e => e.source === unit).length;
          if (numEffectsFromUnitForId > currentColumnCount) {
            currentColumnCount = numEffectsFromUnitForId;
          }
        });
        mapping.set(unit, currentColumnCount);
      });
      return mapping;
    },
  },
  data () {
    return {
      hiddenIndices: [],
      entryColumnDataByEffectId: {},
    };
  },
  methods: {
    getEffectDetails (effect) {
      const type = getEffectType(effect);
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect).forEach(key => {
        // get everything but the blacklisted keys
        if (!this.blacklistedKeys.includes(key)) {
          filteredEffect[key] = effect[key];
        }
      });
      return { type, id, effect: filteredEffect };
    },
    toggleEffectView (i) {
      if (this.hiddenIndices.includes(i)) {
        this.hiddenIndices = this.hiddenIndices.filter(val => val !== i);
      } else {
        this.hiddenIndices.push(i);
      }
    },
    toggleAllEffectViews () {
      if (this.hiddenIndices.length === this.sortedEffectIds.length) {
        this.hiddenIndices = [];
      } else {
        this.hiddenIndices = this.sortedEffectIds.map((val, i) => i);
      }
    },
    isProcBuffList (prop) {
      return prop === 'triggered effect';
    },
    getValueSubgridStyle (effect) {
      const numProps = Object.keys(effect);
      return {
        'grid-template-rows': `repeat(${numProps}, minmax(36px, auto))`,
      };
    },
    convertNumberToColumnSpanStyle (numColumns) {
      return {
        'grid-column-start': `span ${numColumns}`,
      };
    },
    isEmptyArray (obj) {
      return Array.isArray(obj) && obj.length === 0;
    },
    getEffectsHiddenText (numProps) {
      return `${numProps} ${numProps !== 1 ? 'Effects' : 'Effect'} Hidden`;
    },
    getColumnDataForUnitEntry(entry, effectId) {
      if (!this.entryColumnDataByEffectId[effectId]) {
        this.entryColumnDataByEffectId[effectId] = new WeakMap();
      }
      const effectIdEntry = this.entryColumnDataByEffectId[effectId];
      if (!effectIdEntry.has(entry)) {
        const expectedValueColumns = this.columnCountMappingByUnitEntry.get(entry);
        let filteredData = this.effectsById[effectId].filter(effect => effect.source === entry);
        if (filteredData.length > 0 && filteredData.length !== expectedValueColumns) {
          const initialValueColumns = filteredData.length;
          if (expectedValueColumns % initialValueColumns === 0) { // distribute space evenly
            const columnSpan = expectedValueColumns / initialValueColumns;
            filteredData = filteredData.map(entry => ({ ...entry, columnSpan }));
          } else if (expectedValueColumns / initialValueColumns > 2) { // distribute space by a number > 1, favoring items near end of array
            const startIndex = expectedValueColumns % initialValueColumns;
            const columnSpan = (expectedValueColumns - startIndex) / initialValueColumns;
            filteredData = filteredData.map((entry, i) => {
              return i >= startIndex
                ? ({ ...entry, columnSpan })
                : entry;
            });
          } else { // distribute space by giving 1 to rightmost columns
            const diff = expectedValueColumns - initialValueColumns;
            const startIndex = initialValueColumns - diff;
            filteredData = filteredData.map((entry, i) => {
              return i >= startIndex
                ? ({ ...entry, columnSpan: 2 })
                : entry;
            });
          }
        }
        effectIdEntry.set(entry, Object.freeze(filteredData));
      }
      return effectIdEntry.get(entry);
    },
  },
  watch: {
    effectsById () {
      this.entryColumnDataByEffectId = {};
    },
  },
};
</script>

<style lang="less">
div.squad-buff-compare-table-grid {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  display: grid;
  grid-template-columns: minmax(64px, auto) 1fr;
  // border: var(--table-border-settings);

  .header-cell {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  .id-cell {
    height: 100%;
    display: flex;
    align-content: center;
  }

  .id-cell button {
    height: auto;
    min-width: 0;
    flex: auto;

    .v-btn__content {
      flex-wrap: wrap;
    }
  }

  .value-cell {
    text-align: center;
  }

  .property-cell, .value-cell {
    padding: 0.5em;
    word-break: break-word;
    hyphens: auto;
  }

  .property-cell, .header-cell {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .value-cell.header-cell {
    flex-direction: column;
  }

  .property-cell span {
    flex: 1 0 100%;
    text-align: center;
  }

  .id-cell:not(.header-cell), .value-subgrid:not(.header-grid) {
    border-top: 2px solid var(--table-background-color);
    border-bottom: 2px solid var(--table-background-color);
  }

  .is-last-value-cell {
    border-right: 2px solid var(--table-background-color);
  }

  .value-subgrid {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 17.5em 1fr;
    grid-auto-flow: stretch;

    // nested table
    .value-subgrid {
      grid-template-columns: minmax(17.5em, auto) 1fr;
    }

    .even-row:not(.value-cell), .even-row.value-cell:not(:hover) {
      &:not(.only-row) {
        background-color: var(--table-border-color);
      }
    }

    .value-cell:not(.header-cell):hover {
      background-color: var(--background-color--card);
    }

    .value-cell.has-table:not(.header-cell):hover {
      background-color: var(--background-color);
    }
  }
}
</style>
