<template>
  <v-card class="spark-squad-card">
    <!-- <v-layout row class="pa-2" align-center>
      <v-flex>
        <h1 class="title">
          {{ sparkPercentage }} Hits Sparked
        </h1>
      </v-flex>
      <v-flex style="flex-grow: 0;" class="ml-2">
        <v-btn>
          Copy
        </v-btn>
      </v-flex>
    </v-layout> -->
    <v-layout row wrap class="px-2">
      <unit-entry
        v-for="(unit, i) in fullUnits"
        :key="getUnitEntryKey(unit, i)"
        xs12 sm6
        :index="i"
        :unit="unit"
        :getUnit="getUnit"
        :isLead="i === squad.lead"
        :isFriend="i === squad.friend"
        :sparkSimUnitConfig="value.unitConfig[i] || {}"
        :warnings="warningsByUnit.get(unit)"
        @input="$v => updateEntryForUnit($v, i)"
        class="d-flex py-1"
        style="align-items: center; border: 1px solid var(--background-color-alt);"/>
    </v-layout>
    <!-- <v-divider class="mt-2"/>
    <slot name="card-actions">
      <v-card-actions>
        <v-btn flat @click="$emit('share')">
          <v-icon left>share</v-icon>
          Share
        </v-btn>
      </v-card-actions>
    </slot> -->
  </v-card>
</template>

<script>
import {
  unitPositionMapping,
  targetTypes,
  squadBuffTypes,
  ANY_BB_ORDER,
  squadFillerMapping,
} from '@/modules/constants';
import { generateFillerSquadUnitEntry, getEffectsListForSquadUnitEntry } from '@/modules/core/squads';
import {
  getSimulatorOptions,
  getAttackEffectsFromBurst,
  getSimulatorWarningsForSquadUnit,
  getSparkSimUnitConfig,
} from '@/modules/spark-simulator/utils';
import UnitEntry from '@/components/Tools/Squads/SparkStatistics/SparkUnitEntryEditable';
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
    value: {
      type: Object,
      required: true,
    },
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
    warningsByUnit () {
      const mapping = new WeakMap();
      this.fullUnits.forEach((squadUnit, i) => {
        const unitConfig = this.value.unitConfig[i] || {};
        const sourcesToIgnore = ['unit.bb', 'unit.sbb', 'unit.ubb'];
        const unitData = this.getUnit(squadUnit.id) || {};
        const burstAttacks = getAttackEffectsFromBurst(unitData[unitConfig.action || squadUnit.action]);
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
    hasEmptyUnit () {
      return this.fullUnits.some(u => u.id === squadFillerMapping.EMPTY);
    },
  },
  mounted () {
    if (this.hasEmptyUnit) {
      this.checkEmptyUnitBbOrders();
    }
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
    updateEntryForUnit(newValue, index) {
      if (!(newValue instanceof Event)) {
        const unitConfig = this.value.unitConfig.slice();
        unitConfig[index] = newValue;
        this.emitChangedValue({ unitConfig });
      }
    },
    emitChangedValue (newVal = {}) {
      this.$emit('input', getSimulatorOptions({ ...this.value, ...newVal }, this.squad));
    },
    checkEmptyUnitBbOrders () {
      if (Array.isArray(this.value.unitConfig)) {
        let needsUpdate = false;
        const updatedConfig = this.value.unitConfig.map((config, i) => {
          const associatedSquadUnit = this.squad.units[i];
          let newConfig = config;
          if (associatedSquadUnit.id === squadFillerMapping.EMPTY && config.bbOrder !== ANY_BB_ORDER) {
            needsUpdate = true;
            newConfig = getSparkSimUnitConfig({ ...config, bbOrder: ANY_BB_ORDER });
          }
          return newConfig;
        });

        if (needsUpdate) {
          this.emitChangedValue({ unitConfig: updatedConfig });
        }
      }
    },
  },
  watch: {
    hasEmptyUnit (newVal) {
      if (newVal) {
        this.checkEmptyUnitBbOrders();
      }
    },
  },
};
</script>
