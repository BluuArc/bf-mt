<template>
  <v-container fluid>
    <v-layout row>
      <v-flex xs12 class="text-xs-center">
        <v-progress-circular indeterminate/>
        <h4 class="subheading" v-text="loadingMessage || 'Waiting for data to finish loading.'"/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  props: ['loadingMessage'],
};
</script>
