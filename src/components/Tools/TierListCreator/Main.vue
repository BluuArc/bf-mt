<template>
  <v-container fluid>
    <v-layout column>
      <p>Create and share your own tier list for Brave Frontier! Use the configuration controls below to setup categories and entries per category. Once you're ready, go to the <b>Export</b> tab to generate and download the image. Note that even if you're able to download the resulting image here, it is not hosted anywhere; you will need to upload the image on your preferred image host or host the image yourself.</p>
      <p><strong>Note:</strong> This only works in Chrome and Chromium-based browsers.</p>
    </v-layout>
    <tier-list-input-area
      class="flex"
      :inputCategories="categories"
      :inputEntries="entries"
    />
  </v-container>
</template>

<script>
import TierListInputArea from './TierListInputArea';

export default {
  props: {
    categories: {
      type: Array,
      defalt: () => [],
    },
    entries: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    TierListInputArea,
  },
};
</script>

<style>

</style>
