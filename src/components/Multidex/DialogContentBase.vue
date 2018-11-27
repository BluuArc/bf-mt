<template>
  <v-container fluid class="pa-0">
    <v-layout row v-if="loadingEntryData" class="text-xs-center">
      <v-flex>
        <loading-indicator loadingMessage="Loading Entry Data..."/>
      </v-flex>
    </v-layout>
    <v-layout row v-else-if="!entry">
      No entry data found.
    </v-layout>
    <v-layout row v-else>
      <v-flex class="pa-0">
        <slot name="default">
          {{ entry }}
        </slot>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import LoadingIndicator from '@/components/LoadingIndicator';
export default {
  props: {
    entry: {
      type: Object,
    },
    loadingEntryData: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    LoadingIndicator,
  },
};
</script>

<style lang="less">
.multidex-dialog-content-card {
  background-color: var(--background-color)!important;

  .v-tabs__bar {
    background-color: var(--background-color)!important;
  }

  .v-expansion-panel__container {
    background-color: var(--background-color)!important;
  }

  .v-table {
    background-color: var(--background-color)!important;
  }
}
</style>
