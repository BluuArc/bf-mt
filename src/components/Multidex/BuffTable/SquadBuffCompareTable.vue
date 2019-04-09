<template>
  <table class="buff-compare-table">
    <thead>
      <tr>
        <th class="id-column">
          <v-btn flat @click="toggleAllEffectViews" small style="min-width: 36px;">
            <v-icon>{{ hiddenRows.length === mappedEffects.length ? 'fullscreen' : 'fullscreen_exit' }}</v-icon>
            ID
          </v-btn>
        </th>
        <th class="property-column">
          Buff Property
        </th>
        <th class="value-column" v-for="(entry, i) in entries" :key="`${entry}-${i}`">
          <span slot="value-header" :entry="entry">
            {{ entry }}
            One value column for every given unit
          </span>
          <div>Clicking on column will collapse data for it</div>
        </th>
        <th class="value-column" v-for="i in numValueColumns - entries.length" :key="i + entries.length">
          Extra column for effect. Will change
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
            :value="effectEntry.id"
            @click="() => toggleEffectView(i)"/>
          <property-cell
            :class="{ 'property-row--odd first-row': !hiddenRows.includes(i), 'only-row': hiddenRows.includes(i) || propsById[effectId].length === 1 }"
            :collapsed="hiddenRows.includes(i)"
            :value="propsById[effectId][0]"
            :numProps="propsById[effectId].length"/>
          <template v-if="!hiddenRows.includes(i) && entries.length > 0">
            <value-cell
              v-for="(entry, e) in effectsById[effectId]"
              :key="e"
              :class="{ 'value-row--odd first-row': true, 'only-row': propsById[effectId].length === 1 }"
              :value="entry.effect[propsById[effectId][0]]"
              :isProcBuffList="isProcBuffList(entry, propsById[effectId][0])"/>
          </template>
        </tr>
        <!-- subsequent buff rows for given ID -->
        <template v-if="!hiddenRows.includes(i) && propsById[effectId].length > 1">
          <property-value-row
            v-for="(prop, j) in propsById[effectId].slice(1)"
            :key="`${effectId}-${i}-${j}`"
            :propertyCellClass="{ 'property-column': true, [`property-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === propsById[effectId].length }"
            :valueCellClass="{ 'value-column': true, [`value-row--${j % 2 === 0 ? 'even' : 'odd'}`]: true, 'last-row': j + 1 === propsById[effectId].length }"
            :propName="prop"
            :propValue="effectsById[effectId]"
            :hasMultipleValues="true"
            :isProcBuffList="isProcBuffList(effectEntry, prop)"/>
        </template>
      </template>
    </tbody>
  </table>
</template>

<script>
import { getEffectType, getEffectId } from '@/modules/EffectProcessor/processor-helper';
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
  },
  components: {
    IdCell,
    PropertyCell,
    ValueCell,
    PropertyValueRow,
  },
  computed: {
    idKeys: () => ['passive id', 'unknown passive id', 'proc id', 'unknown proc id'],
    // assumption: 1 type of effect (passive or proc)
    effectsById () {
      const mapping = this.entries.reduce((acc, entry) => {
        const effects = this.getEntryEffects(entry);
        effects.forEach(effect => {
          const effectDetails = this.getEffectDetails(effect);
          effectDetails.source = effect.source || entry;

          if (!acc[effectDetails.id]) {
            acc[effectDetails.id] = [];
          }
          acc[effectDetails.id].push(effectDetails);
          return acc;
        });
      }, {});
      return Object.freeze(mapping);
    },
    propsById () {
      // given an ID, return an array of property names
      const mapping = Object.keys(this.effectsById).reduce((acc, key) => {
        const props = new Set();

        const effects = this.effectsById[key];
        effects.forEach(effect => {
          Object.keys(effect).forEach(prop => {
            props.add(prop);
          });
        });
        acc[key] = Array.from(props).sort((a, b) => a < b ? -1 : 1));
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
  },
  data () {
    return {
      hiddenRows: [],
    },
  },
  methods: {
    getEffectsFromSquadUnitEntry (unitEntry) {
      const mapping = {};
      if (unitEntry)
    },
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
        this.hiddenRows = this.mappedEffects.map((val, i) => i);
      }
    },
    isProcBuffList (effectEntry, prop) {
      return effectEntry.type === 'passive' && +effectEntry.id === 66 && prop === 'triggered effect';
    },
  },
},
</script>
