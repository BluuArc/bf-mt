<template>
  <section class="squad-buff-expandable-list">
    <v-expansion-panel v-model="expandedTables" expand focusable>
      <v-expansion-panel-content v-for="(effectId, i) in sortedEffectIds" :key="effectId">
        <div slot="header" class="expandable-list-entry--header" :key="i">
          <span class="expandable-list-entry--title" v-text="`${effectId }: ${effectNameById[effectId] }`"/>
          <span>
            {{ getSquadEntriesForEffectId(effectId).map(u => ({ id: u.id, position: u.position })) }}
          </span>
        </div>
        <value-subgrid
          :properties="propsById[effectId]"
          :values="getSquadEntriesForEffectId(effectId).map(u => getValueSubgridEntry(u, effectId))"
        >
        </value-subgrid>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </section>
</template>

<script>
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';
import { getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import { getEffectName } from '@/modules/core/buffs';
import ValueSubgrid from '@/components/Multidex/BuffTableGrid/ValueSubgrid';
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
    ValueSubgrid,
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
          effectDetails.source = entry;

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
        acc[key] = Object.freeze(Array.from(props).sort((a, b) => {
          // source path should be at bottom of cell (end of array)
          if (b === 'sourcePath') {
            return -1;
          } else if (a === 'sourcePath') {
            return 1;
          } else {
            return a < b ? -1 : 1;
          }
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
      valueSubgridEntryByEntryByEffectId: {},
    };
  },
  methods: {
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
      return Array.from(new Set(this.effectsById[id].map(e => e.source)));
    },
  },
};
</script>

<style lang="less">
.squad-buff-expandable-list {
  .v-expansion-panel__header {
    padding-left: 8px;
    padding-right: 8px;
  }
  .expandable-list-entry--header {
    display: flex;
    align-items: center;
  }
}
</style>
