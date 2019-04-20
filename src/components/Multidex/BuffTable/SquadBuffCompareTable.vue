<template>
  <table class="squad-buff-compare-table" :style="`width: ${tableWidth}`">
    <!-- <pre v-text="JSON.stringify(effectsById, null, 2)"/> -->
    <thead>
      <tr>
        <th class="id-column">
          <v-btn flat @click="toggleAllEffectViews" small style="min-width: 36px;">
            <v-icon>{{ hiddenRows.length === sortedEffectIds.length ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
            ID
          </v-btn>
        </th>
        <th class="property-column">
          Buff Property
        </th>
        <th
          v-for="(entry, i) in unitEntries" :key="`${entry}-${i}`"
          :colspan="columnCountMappingByUnitEntry.get(entry)"
          class="value-column">
          <span slot="value-header" :entry="entry">
            {{ entry.id }} / {{ entry.position }}
          </span>
          <div>Clicking on column will collapse data for it</div>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(effectId, i) in sortedEffectIds">
        <tr :key="`${effectId}-${i}`">
          <id-cell
            :class="{ 'first-row': true, 'only-row': hiddenRows.includes(i) || propsById[effectId].length === 1 }"
            :rowspan="hiddenRows.includes(i) ? 1 : propsById[effectId].length"
            :collapsed="hiddenRows.includes(i)"
            :value="effectId"
            @click="() => toggleEffectView(i)"/>
          <property-cell
            :class="{ 'property-row--odd first-row': !hiddenRows.includes(i), 'only-row': hiddenRows.includes(i) || propsById[effectId].length === 1 }"
            :collapsed="hiddenRows.includes(i)"
            :value="propsById[effectId][0]"
            :numProps="propsById[effectId].length"/>
          <template v-if="!hiddenRows.includes(i) && unitEntries.length > 0">
            <template v-for="(unitEntry, u) in unitEntries">
              <td 
                v-if="effectsById[effectId].filter(effect => effect.source === unitEntry).length === 0"
                :colspan="columnCountMappingByUnitEntry.get(unitEntry)"
                :key="`${u}-empty`">
                (None)
              </td>
              <template v-else>
                <td
                  v-for="(valueEntry, e) in effectsById[effectId].filter(effect => effect.source === unitEntry)"
                  :key="`${u}-${e}`">
                  {{valueEntry.effect[propsById[effectId][0]] !== undefined ? valueEntry.effect[propsById[effectId][0]] : '(None)'}}
                </td>
              </template>
            </template>
            <!-- <value-cell
              v-for="(valueEntry, e) in effectsById[effectId].effects"
              :key="e"
              :class="{ 'value-row--odd first-row': true, 'only-row': propsById[effectId].length === 1 }"
              :value="valueEntry.effect[propsById[effectId][0]]"
              :isProcBuffList="isProcBuffList(valueEntry, propsById[effectId][0])"/> -->
          </template>
        </tr>
        
        <!-- <template v-if="!hiddenRows.includes(i) && propsById[effectId].length > 1">
          <property-value-row
            v-for="(prop, j) in propsById[effectId].slice(1)"
            :key="`${effectId}-${i}-${j}`"
            :propertyCellClass="{ 'property-column': true, [`property-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === propsById[effectId].length }"
            :valueCellClass="{ 'value-column': true, [`value-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === propsById[effectId].length }"
            :propName="prop"
            :propValue="effectsById[effectId]"
            :hasMultipleValues="true"
            :isProcBuffList="isProcBuffList(effectEntry, prop)"/>
        </template> -->
      </template>
    </tbody>
  </table>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import IdCell from '@/components/Multidex/BuffTable/IdCell';
import PropertyCell from '@/components/Multidex/BuffTable/PropertyCell';
import ValueCell from '@/components/Multidex/BuffTable/ValueCell';
import PropertyValueRow from '@/components/Multidex/BuffTable/PropertyValueRow';
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
  components: {
    IdCell,
    PropertyCell,
    ValueCell,
    PropertyValueRow,
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
    unitEntries () {
      return this.squad.units;
    },
    // assumption: 1 type of effect (passive or proc)
    effectsById () {
      // mapping already in order of unit entries
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
        acc[key] = Array.from(props).sort((a, b) => a < b ? -1 : 1);
        return acc;
      }, {});
      return Object.freeze(mapping);
    },
    sortedEffectIds () {
      return Object.keys(this.effectsById).sort((a, b) => +a - +b);
    },
    numValueColumns () {
      return Math.max(...Object.keys(this.effectsById).map(id => this.effectsById[id].length));
    },
    columnCountMappingByUnitEntry () {
      const mapping = new WeakMap();
      const { sortedEffectIds, effectsById } = this;
      this.unitEntries.forEach(unit => {
        let currentColumnCount = 1;
        sortedEffectIds.forEach(id => {
          const numEffectsFromUnit = effectsById[id].filter(e => e.source === unit).length;
          if (numEffectsFromUnit > currentColumnCount) {
            currentColumnCount = numEffectsFromUnit;
          }
        });
        mapping.set(unit, currentColumnCount);
      });
      return mapping;
    },
    tableWidth () {
      const numValueColumns = this.unitEntries.reduce((acc, unit) => {
        return acc + this.columnCountMappingByUnitEntry.get(unit);
      }, 0);
      return `calc(5em + 17.5em + ${numValueColumns * 13.5}em)`;
    },
  },
  data () {
    return {
      hiddenRows: [],
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
      if (this.hiddenRows.includes(i)) {
        this.hiddenRows = this.hiddenRows.filter(val => val !== i);
      } else {
        this.hiddenRows.push(i);
      }
    },
    toggleAllEffectViews () {
      if (this.hiddenRows.length === this.sortedEffectIds.length) {
        this.hiddenRows = [];
      } else {
        this.hiddenRows = this.sortedEffectIds.map((val, i) => i);
      }
    },
    isProcBuffList (effectEntry, prop) {
      return effectEntry.type === 'passive' && +effectEntry.id === 66 && prop === 'triggered effect';
    },
  },
};
</script>

<style lang="less">
table.squad-buff-compare-table {
  --table-border-color: var(--background-color-alt);
  --table-background-color: var(--background-color-alt--lighten-1);
  --table-border-settings: 1px solid var(--table-border-color);

  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border: var(--table-border-settings);

  &:not(.is-nested) {
    min-width: 40em;
  }

  .is-nested .property-column {
    width: 10em;
  }

  & > thead, & > tbody {
    td, th {
      border: var(--table-border-settings);
      text-align: center;
    }

    td:not(.id-column) {
      padding: 0.5em 0;
    }

    .id-column {
      width: 5em;

      button.collapse-btn {
        height: auto;
        min-width: 0;

        .v-btn__content {
          flex-wrap: wrap;
        }
      }
    }

    .property-column {
      width: 17.5em;
    }

    .value-column {
      min-width: 13.5em;
    }

    .first-row, .only-row {
      border-top: 2px solid var(--table-background-color);
    }

    .last-row, .only-row {
      border-bottom: 2px solid var(--table-background-color);
    }
  }

  & > thead > th {
    font-weight: bold;
    border-bottom: var(--table-border-settings);
  }

  .property-row--odd:not(.only-row), .value-row--odd:not(.only-row) {
    background-color: var(--table-border-color);
  }
}
</style>
