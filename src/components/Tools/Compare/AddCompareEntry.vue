<template>
  <v-stepper vertical v-model="currentStep">
    <v-stepper-step :complete="validTypeSelected" step="1">
      Select Entry Type
    </v-stepper-step>
    <v-stepper-content step="1">
      Select an entry type here
      <v-btn @click="currentStep += 1">Continue</v-btn>
    </v-stepper-content>

    <v-stepper-step step="2">
      Select Entry
    </v-stepper-step>

    <v-stepper-content>
      Selector goes here
    </v-stepper-content>
  </v-stepper>
</template>

<script>
import { COMPARE_KEY_ORDER } from '@/modules/constants';

export default {
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  computed: {
    validTypeSelected () {
      return COMPARE_KEY_ORDER.includes(this.selectedType);
    },
  },
  data () {
    return {
      selectedType: '',
      currentStep: 1,
    };
  },
  watch: {
    type: {
      immediate: true,
      handler (newType) {
        this.selectedType = newType || '';
      },
    },
  },
};
</script>

<style>

</style>
