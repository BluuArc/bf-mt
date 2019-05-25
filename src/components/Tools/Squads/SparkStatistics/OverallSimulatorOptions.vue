<template>
  <v-layout row wrap class="overall-simulator-options">
    <v-flex xs12 sm4 md2>
      <span>Set All Orders:</span>
    </v-flex>
    <v-flex xs6 sm4 md2>
      <v-btn class="mx-2" @click="setAllOrdersInitial">Initial</v-btn>
    </v-flex>
    <v-flex xs6 sm4 md2>
      <v-btn class="mx-2" @click="setAllOrdersAny">Any</v-btn>
    </v-flex>
    <v-flex xs12 sm4 md2>
      <span>Set All Positions:</span>
    </v-flex>
    <v-flex xs6 sm4 md2>
      <v-btn class="mx-2" @click="() => setAllPositions(true)">Locked</v-btn>
    </v-flex>
    <v-flex xs6 sm4 md2>
      <v-btn class="mx-2" @click="() => setAllPositions(false)">Unlocked</v-btn>
    </v-flex>
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
        :hint="workerCountFieldLabel"
        persistent-hint
        @input="$v => emitChangedValue({ workerCount: $v })"
      />
    </v-flex>
  </v-layout>
</template>

<script>
import { ANY_BB_ORDER } from '@/modules/constants';
import { getSimulatorOptions, getSparkSimUnitConfig } from '@/modules/spark-simulator/utils';

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
    workerCountFieldLabel () {
      return `Max: ${navigator.hardwareConcurrency || 2}`;
    },
  },
  data () {
    return {
      burstCutins: false,
    };
  },
  methods: {
    emitChangedValue (newVal = {}) {
      this.$emit('input', getSimulatorOptions({ ...this.value, ...newVal }, this.squad));
    },
    setAllOrdersInitial () {
      const newUnitConfig = this.value.unitConfig.map((config, i) => {
        const unit = this.squad.units[i];
        return getSparkSimUnitConfig({ ...config, bbOrder: unit.bbOrder });
      });
      this.emitChangedValue({ unitConfig: newUnitConfig });
    },
    setAllOrdersAny () {
      const newUnitConfig = this.value.unitConfig.map(config => getSparkSimUnitConfig({ ...config, bbOrder: ANY_BB_ORDER }));
      this.emitChangedValue({ unitConfig: newUnitConfig });
    },
    setAllPositions (locked) {
      const newUnitConfig = this.value.unitConfig.map(config => getSparkSimUnitConfig({ ...config, lockPosition: !!locked }));
      this.emitChangedValue({ unitConfig: newUnitConfig });
    },
  },
  watch: {
    value: {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          this.burstCutins = !!newValue.burstCutins;
        }
      },
    },
    burstCutins (newValue) {
      this.emitChangedValue({ burstCutins: newValue });
    },
  },
};
</script>

<style lang="less">
.overall-simulator-options {
  align-items: baseline;
  .v-input, span {
    margin: 0.5em;
    flex-shrink: 0;
  }
}
</style>
