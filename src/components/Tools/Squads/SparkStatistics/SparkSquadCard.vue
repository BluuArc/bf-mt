<template>
  <v-card class="spark-squad-card">
    <v-layout row class="pa-2" align-center>
      <v-flex>
        <h1 class="title">
          {{ sparkPercentage }} Weighted Hits Sparked
        </h1>
      </v-flex>
      <v-flex style="flex: none;">
        <v-btn
          icon flat
          :color="bbOrderColorToggleIconColor"
          @click="toggleBbOrderColor"
        >
          <v-icon>color_lens</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
    <v-layout row wrap class="px-2">
      <unit-entry
        v-for="(unit, i) in fullUnits"
        :key="getUnitEntryKey(unit, i)"
        xs12 sm6
        :index="i"
        :unit="unit"
        :getUnit="getUnit"
        :isLead="squad.units.indexOf(unit) === squad.lead"
        :isFriend="squad.units.indexOf(unit) === squad.friend"
        :sparkResultForUnit="sparkResultsByUnit.get(unit)"
        :relativeWeight="relativeWeightByUnit.get(unit)"
        :warnings="warningsByUnit.get(unit)"
        :burstCutins="simulatorOptions.burstCutins"
        class="d-flex py-1"
        style="align-items: center; border: 1px solid var(--background-color-alt);"/>
    </v-layout>
    <v-divider class="mt-2"/>
    <slot name="card-actions">
      <v-card-actions>
        <v-btn flat @click="$emit('share')">
          <v-icon left>share</v-icon>
          Share
        </v-btn>
      </v-card-actions>
    </slot>
  </v-card>
</template>

<script>
import {
  unitPositionMapping,
  targetTypes,
  squadBuffTypes,
} from '@/modules/constants';
import { generateFillerSquadUnitEntry, getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import {
  getAttackEffectsFromBurst,
  getSimulatorWarningsForSquadUnit,
} from '@/modules/spark-simulator/utils';
import UnitEntry from '@/components/Tools/Squads/SparkStatistics/SparkUnitEntry';
import GettersMixin from '@/components/Tools/Squads/SynchronousGettersMixin';

export default {
  mixins: [GettersMixin],
  components: {
    UnitEntry,
  },
  props: {
    squad: {
      type: Object,
      required: true,
    },
    sparkResult: {
      type: Object,
      required: true,
    },
    simulatorOptions: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // fills empty positions with empty values
    fullUnits () {
      return unitPositionMapping.map(position => {
        const unitSparkResult = this.sparkResult.squad.find(r => r.position === position);
        let unit = this.squad.units.find(unit => unit.position === unitSparkResult.originalPosition);
        if (!unit) { // empty position, so fill it with empty data
          unit = generateFillerSquadUnitEntry({ isEmpty: true, bbOrder: null, position });
        }

        return unit;
      });
    },
    sparkResultsByUnit () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(unit => {
        mapping.set(unit, this.sparkResult.squad.find(u => u.originalPosition === unit.position));
      });
      return mapping;
    },
    sparkPercentage () {
      return `${(this.sparkResult.weightedPercentage * 100).toFixed(2)}%`;
    },
    warningsByUnit () {
      const mapping = new WeakMap();
      this.fullUnits.forEach(squadUnit => {
        const sourcesToIgnore = ['unit.bb', 'unit.sbb', 'unit.ubb'];
        const unitData = this.getUnit(squadUnit.id) || {};
        const burstAttacks = getAttackEffectsFromBurst(unitData[squadUnit.action]);
        const extraAttacks = getEffectsListForSquadUnitEntry({
          unitEntry: squadUnit,
          target: targetTypes.ENEMY,
          effectType: squadBuffTypes.PROC,
          squad: this.squad,
        }, this)
          .filter(effect => !sourcesToIgnore.includes(effect.sourcePath) && (!effect.triggeredOn || (effect.triggeredOn === squadUnit.action)));

        mapping.set(squadUnit, getSimulatorWarningsForSquadUnit({
          unit: squadUnit,
          attackEffects: burstAttacks.concat(extraAttacks),
          unitData,
        }));
      });
      return mapping;
    },
    totalWeight () {
      return Math.max(1, this.sparkResult.squad.reduce((acc, val) => acc + val.weight, 0));
    },
    relativeWeightByUnit () {
      const mapping = new WeakMap();
      const sparkResultMapping = this.sparkResultsByUnit;
      const totalWeight = this.totalWeight;
      this.fullUnits.forEach(squadUnit => {
        const result = sparkResultMapping.get(squadUnit);
        const weight = result.weight / totalWeight * 100;
        mapping.set(squadUnit, +(weight.toFixed(2)));
      });
      return mapping;
    },
    bbOrderColorToggleIconColor () {
      return this.$store.state.showBbOrderColors
        ? 'primary'
        : undefined;
    },
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
    toggleBbOrderColor () {
      this.$store.commit('setShowSparkOrderColors', !this.$store.state.showBbOrderColors);
    },
  },
};
</script>
