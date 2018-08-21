<template>
  <v-card raised>
    <v-card-title>
      <slot name="title" class="title">Settings Title</slot>
    </v-card-title>
    <v-card-text style="overflow-x: auto;">
      <slot name="body">
        Settings options go here
      </slot>
    </v-card-text>
    <v-card-actions>
      <v-btn :disabled="disableSubmission" flat @click="formSubmit">Apply Changes</v-btn>
      <v-btn flat @click="formReset">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
const noop = () => {};
export default {
  props: {
    disableSubmission: {
      type: Boolean,
      default: false,
    },
    formSubmit: {
      type: Function,
      default: noop,
    },
    formReset: {
      type: Function,
      default: noop,
    },
  },
};
</script>
