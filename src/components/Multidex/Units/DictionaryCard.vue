<template>
  <description-card-base
    :entry="entry"
    materialColor="green darken-3"
    :titleHtmlGenerator="() => 'Flavor Text'"
    :treeOptions="{ maxDepth: 1 }"
    :effectGetter="() => []"
    :tabNames="tabNames">
    <v-container fluid class="pa-0" v-for="tab in tabNames" :key="tab" :slot="tab">
      <span v-html="entry.dictionary[tab === 'lore' ? 'description' : tab]"/>
    </v-container>
  </description-card-base>
</template>

<script>
import DescriptionCardBase from '@/components/Multidex/DescriptionCardBase';
import CardTitleWithLink from '@/components/CardTitleWithLink';

export default {
  props: {
    entry: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    DescriptionCardBase,
    CardTitleWithLink,
  },
  computed: {
    tabNames () {
      return this.entry.dictionary
        ? Object.keys(this.entry.dictionary).map(k => k === 'description' ? 'lore' : k).sort()
        : [];
    },
  },
};
</script>
