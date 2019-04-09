<template>
  <table :class="{ 'buff-table': true, 'is-nested': isNested }">
    <thead v-if="showHeaders">
      <tr>
        <th class="id-column">
          <v-btn flat @click="toggleAllEffectViews" small style="min-width: 36px;">
            <v-icon>{{ hiddenIndices.length === mappedEffects.length ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
            ID
          </v-btn>
        </th>
        <th class="property-column">
          Buff Property
        </th>
        <th class="value-column">
          Buff Value
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(effectEntry, i) in mappedEffects">
        <tr :key="`${effectEntry.id}-${i}`">
          <!-- ID cell -->
          <id-cell
            :class="{ 'first-row': true, 'only-row': hiddenIndices.includes(i) || getSortedProps(effectEntry.effect).length === 1 }"
            :rowspan="hiddenIndices.includes(i) ? 1 : getSortedProps(effectEntry.effect).length"
            :collapsed="hiddenIndices.includes(i)"
            :value="effectEntry.id"
            @click="() => toggleEffectView(i)"/>
          <property-cell
            :class="{ 'property-row--odd first-row': !hiddenIndices.includes(i), 'only-row': hiddenIndices.includes(i) || getSortedProps(effectEntry.effect).length === 1 }"
            :collapsed="hiddenIndices.includes(i)"
            :value="getSortedProps(effectEntry.effect)[0]"
            :numProps="getSortedProps(effectEntry.effect).length"/>
          <value-cell
            v-if="!hiddenIndices.includes(i)"
            :class="{ 'value-row--odd first-row': true, 'only-row': getSortedProps(effectEntry.effect).length === 1 }"
            :value="effectEntry.effect[getSortedProps(effectEntry.effect)[0]]"
            :isProcBuffList="isProcBuffList(effectEntry, getSortedProps(effectEntry.effect)[0])"/>
        </tr>

        <!-- subsequent buff rows for given ID -->
        <template v-if="!hiddenIndices.includes(i) && getSortedProps(effectEntry.effect).length > 1">
          <property-value-row
            v-for="(prop, j) in getSortedProps(effectEntry.effect).slice(1)"
            :key="`${effectEntry.id}-${i}-${j}`"
            :propertyCellClass="{ 'property-column': true, [`property-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === getSortedProps(effectEntry.effect).length }"
            :valueCellClass="{ 'value-column': true, [`value-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === getSortedProps(effectEntry.effect).length }"
            :propName="prop"
            :propValue="effectEntry.effect[prop]"
            :isProcBuffList="isProcBuffList(effectEntry, prop)"/>
        </template>
      </template>
    </tbody>
  </table>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
import IdCell from './IdCell';
import PropertyCell from './PropertyCell';
import ValueCell from './ValueCell';
import PropertyValueRow from './PropertyValueRow';

export default {
  props: {
    effects: {
      type: Array,
      default: () => [],
    },
    showHeaders: {
      type: Boolean,
      default: false,
    },
    isNested: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    IdCell,
    PropertyCell,
    ValueCell,
    PropertyValueRow,
  },
  computed: {
    idKeys: () => ['passive id', 'unknown passive id', 'proc id', 'unknown proc id'],
    mappedEffects () {
      return this.effects.map(this.getEffectDetails);
    },
    hasBuffTable () {
      return this.mappedEffects.some(entry => entry.type === 'passive' && +entry.id === 66);
    },
  },
  data () {
    return {
      sortedPropsCache: new WeakMap(),
      hiddenIndices: [],
    };
  },
  methods: {
    getEffectDetails (effect) {
      const type = getEffectType(effect);
      const id = getEffectId(effect);
      const filteredEffect = {};
      Object.keys(effect).forEach(key => {
        // get everything but the ID
        if (!this.idKeys.includes(key)) {
          filteredEffect[key] = effect[key];
        }
      });
      return { type, id, effect: filteredEffect };
    },
    getSortedProps (effect) {
      if (!this.sortedPropsCache.has(effect)) {
        this.sortedPropsCache.set(effect, Object.keys(effect).sort((a, b) => a < b ? -1 : 1));
      }
      return this.sortedPropsCache.get(effect);
    },
    toggleEffectView (i) {
      if (this.hiddenIndices.includes(i)) {
        this.hiddenIndices = this.hiddenIndices.filter(val => val !== i);
      } else {
        this.hiddenIndices.push(i);
      }
    },
    toggleAllEffectViews () {
      if (this.hiddenIndices.length === this.mappedEffects.length) {
        this.hiddenIndices = [];
      } else {
        this.hiddenIndices = this.mappedEffects.map((val, i) => i);
      }
    },
    isProcBuffList (effectEntry, prop) {
      return effectEntry.type === 'passive' && +effectEntry.id === 66 && prop === 'triggered effect';
    },
  },
  name: 'buff-table',
};
</script>

<style lang="less">
table.buff-table {
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
