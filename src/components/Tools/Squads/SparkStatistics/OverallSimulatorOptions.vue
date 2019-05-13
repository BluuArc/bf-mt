<template>
  <v-layout row wrap class="overall-simulator-options">
    <v-flex xs12>
      <v-layout row wrap align-baseline>
        <v-text-field
          label="Enemy Count"
          type="number"
          hint="There must be at least 2 enemies to ensure accuracy"
          persistent-hint
        />
        <v-switch
          label="SBB Cutins are on/off"
          hide-details
        />
        <v-text-field
          label="Overall Delay (frames)"
          type="number"
          hide-details
        />
      </v-layout>
    </v-flex>
    <v-flex xs12 sm6>
      <v-text-field
        label="Result Threshold"
        type="number"
        suffix="%"
      />
    </v-flex>
    <v-flex xs12 sm6>
      <v-text-field
        label="Worker Count"
        type="number"
      />
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
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
