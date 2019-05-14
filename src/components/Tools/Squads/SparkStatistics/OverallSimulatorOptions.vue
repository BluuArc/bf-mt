<template>
  <v-layout row wrap class="overall-simulator-options">
    <v-flex xs12>
      <v-layout row wrap align-baseline>
        <v-text-field
          label="Enemy Count"
          type="number"
          hint="There must be at least 2 enemies to ensure accuracy"
          :value="value.enemyCount"
          @input="$v => emitChangedValue({ enemyCount: $v })"
          persistent-hint
        />
        <v-switch
          :label="burstCutinToggleLabel"
          :value="value.burstCutins"
          @change="$v => emitChangedValue({ burstCutins: $v })"
          hide-details
        />
        <v-text-field
          label="Overall Delay (frames)"
          type="number"
          :value="value.overallDelay"
          @input="$v => emitChangedValue({ overallDelay: $v })"
          hide-details
        />
      </v-layout>
    </v-flex>
    <v-flex xs12 sm6>
      <v-text-field
        label="Result Threshold"
        type="number"
        :value="value.resultThreshold"
        @input="$v => emitChangedValue({ resultThreshold: $v })"
        suffix="%"
      />
    </v-flex>
    <v-flex xs12 sm6>
      <v-text-field
        label="Worker Count"
        type="number"
        :value="value.workerCount"
        @input="$v => emitChangedValue({ workerCount: $v })"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import { getSimulatorOptions } from '@/modules/spark-simulator/utils';

export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
    squad: {
      type: Object,
      required: true,
    },
  },
  computed: {
    burstCutinToggleLabel () {
      return `Burst Cutins are ${this.value.burstCutins ? 'on' : 'off'}`;
    },
  },
  methods: {
    emitChangedValue (newVal = {}) {
      this.$emit('input', getSimulatorOptions({ ...this.value, ...newVal }, this.squad));
    },
  },
};
</script>

<style lang="less">
.overall-simulator-options {
  .v-input {
    margin: 0.5em;
  }
}
</style>
