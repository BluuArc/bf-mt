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
import { unitPositionMapping } from '@/modules/constants';
import { generateFillerSquadUnitEntry } from '@/modules/core/squads';
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
  },
  methods: {
    getUnitEntryKey (unit = {}, i = 0) {
      return `${JSON.stringify(unit)}-${i}`;
    },
  },
};
</script>
