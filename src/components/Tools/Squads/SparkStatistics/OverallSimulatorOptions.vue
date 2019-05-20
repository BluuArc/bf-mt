<template>
  <v-layout row wrap class="overall-simulator-options">
    <v-flex xs12 sm6>
      <v-text-field
        label="Enemy Count"
        type="number"
        hint="There must be at least 2 enemies to ensure accuracy"
        :value="value.enemyCount"
        @input="$v => emitChangedValue({ enemyCount: $v })"
        persistent-hint
      />
    </v-flex>
    <v-flex xs12 sm6>
      <v-switch
        :label="burstCutinToggleLabel"
        v-model="burstCutins"
        hide-details
      />
    </v-flex>
    <v-flex xs12 sm6>
      <v-checkbox
        label="Optimize Order"
        v-model="optimizeOrder"
      />
    </v-flex>
    <v-flex xs12 sm6>
      <v-checkbox
        label="Optimize Position"
        v-model="optimizePosition"
      />
    </v-flex>
    <v-flex xs12 sm4>
      <v-text-field
        label="Result Threshold"
        type="number"
        :value="value.resultThreshold"
        @input="$v => emitChangedValue({ resultThreshold: $v })"
        suffix="%"
      />
    </v-flex>
    <v-flex xs12 sm4>
      <v-text-field
        label="Max Results"
        type="number"
        :value="value.maxResults"
        @input="$v => emitChangedValue({ maxResults: $v })"
      />
    </v-flex>
    <v-flex xs12 sm4>
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
  data () {
    return {
      burstCutins: false,
      optimizeOrder: false,
      optimizePosition: false,
    };
  },
  methods: {
    emitChangedValue (newVal = {}) {
      this.$emit('input', getSimulatorOptions({ ...this.value, ...newVal }, this.squad));
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          this.burstCutins = !!newValue.burstCutins;
          this.optimizeOrder = !!newValue.optimizeOrder;
          this.optimizePosition = !!newValue.optimizePosition;
        }
      },
    },
    burstCutins (newValue) {
      this.emitChangedValue({ burstCutins: newValue });
    },
    optimizeOrder (newValue) {
      this.emitChangedValue({ optimizeOrder: newValue });
    },
    optimizePosition (newValue) {
      this.emitChangedValue({ optimizePosition: newValue });
    },
  },
};
</script>

<style lang="less">
.overall-simulator-options {
  align-items: baseline;
  .v-input {
    margin: 0.5em;
    flex-shrink: 0;
  }
}
</style>
