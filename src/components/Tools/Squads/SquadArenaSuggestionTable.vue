<template>
  <section class="squad-arena-suggestion-table">
    <span
      style="text-transform: capitalize; font-weight: bold; text-align: center; grid-column: span 2;"
      v-html="`<u>Applicable Colosseum Classes:</u> ${usableColoClasses.join(', ')}`"
    />
    <template v-for="(unit, i) in fullUnits">
      <div :key="`${unit.position}-suggestion`" class="suggestion-text">
        <template v-if="i !== squad.friend">
          <div
            style="text-transform: capitalize; font-weight: bold; text-align: center;"
            v-html="`<u>Suggestion:</u> ${suggestionsBySquadEntry.get(unit).join(' or ')}`"
          />
          <div
            v-for="(arenaText, a) in arenaTextDataBySquadEntry.get(unit)"
            :key="`${unit.position}-${a}-arena-text`"
            v-text="arenaText"
          />
        </template>
        <span v-else>
          Friend units are not allowed in Arena
        </span>
      </div>
      <unit-entry :key="`${unit.position}-entry`"
        :index="i"
        :unit="unit"
        :getUnit="getUnit"
        :getItem="getItem"
        :getExtraSkill="getExtraSkill"
        :isLead="i === squad.lead"
        :isFriend="i === squad.friend"
        class="d-flex py-1"
        style="align-items: center; border: 1px solid var(--background-color-alt);"
      />
    </template>
  </section>
</template>

<script>
import {
  getArenaPositionRecommendation,
  arenaConditionCodeToText,
  arenaConditionToText,
  getColoClassUsage,
} from '@/modules/core/units';
import { generateFillerSquadUnitEntry } from '@/modules/core/squads';
import { unitPositionMapping, squadFillerMapping } from '@/modules/constants';
import UnitEntry from '@/components/Tools/Squads/SquadUnitEntry';
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
    UnitEntry,
  },
  computed: {
    // fills empty positions with empty values
    fullUnits () {
      return unitPositionMapping.map(position => {
        let unit = this.squad.units.find(unit => unit.position === position);
        if (!unit) { // empty position, so fill it with empty data
          unit = generateFillerSquadUnitEntry({ isEmpty: true, bbOrder: null, position });
        }

        return unit;
      });
    },
    suggestionsBySquadEntry () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(unit => {
        const unitData = this.getUnit(unit.id) || {};
        mapping.set(unit, this.getSuggestionsForUnit(unitData));
      });
      return mapping;
    },
    arenaTextDataBySquadEntry () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(unit => {
        const unitData = this.getUnit(unit.id) || {};
        const aiData = Array.isArray(unitData.ai) ? unitData.ai : [];
        // console.warn(unit.position, aiData);
        if (aiData.length > 0) {
          mapping.set(unit, aiData.map(this.generateArenaText));
        } else {
          mapping.set(unit, ['No Arena AI data found']);
        }
      });
      return mapping;
    },
    usableColoClasses () {
      const classesBySquadEntry = new Map();
      const activeServer = this.$store.state.settings.activeServer;
      const applicableUnits = this.fullUnits
        .filter((u, i) => i !== this.squad.friend
          && u.id !== squadFillerMapping.EMPTY
          && u.id !== squadFillerMapping.ANY
        );
      
      applicableUnits.forEach(unit => {
        const unitData = this.getUnit(unit.id) || {};
        const applicableColoClasses = !isNaN(unitData.cost)
          ? getColoClassUsage(+unitData.cost, activeServer === 'gl')
          : [];
        classesBySquadEntry.set(unit, applicableColoClasses);
      });
      
      const commonColoClasses = new Set();
      applicableUnits.forEach(unit => {
        const currentClasses = classesBySquadEntry.get(unit);
        const otherUnits = applicableUnits.filter(u => u !== unit);
        currentClasses.forEach(coloClass => {
          if (!commonColoClasses.has(coloClass) && otherUnits.every(otherUnit => classesBySquadEntry.get(otherUnit).includes(coloClass))) {
            commonColoClasses.add(coloClass);
          }
        });
      });

      return Object.freeze(Array.from(commonColoClasses));
    },
  },
  methods: {
    getSuggestionsForUnit (unit = {}) {
      return Object.freeze(getArenaPositionRecommendation(unit).map(arenaConditionCodeToText));
    },
    generateArenaText (data = {}) {
      return arenaConditionToText(data);
    },
  },
};
</script>

<style lang="less">
.squad-arena-suggestion-table {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 1fr) minmax(300px, 1fr);

  .suggestion-text {
    align-self: center;
    justify-self: center;
  }
}
</style>
