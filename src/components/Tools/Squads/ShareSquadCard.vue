<template>
  <v-card>
    <card-tabs-container :tabs="tabConfig">
      <v-layout row slot="markdown">
        markdown {{ squad.name }}
      </v-layout>
      <v-layout row slot="json">
        json {{ squad }}
      </v-layout>
    </card-tabs-container>
    <v-card-actions>
      <v-btn flat>Copy</v-btn>
      <v-spacer/>
      <v-btn flat @click="$emit('back')">Back</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import CardTabsContainer from '@/components/CardTabsContainer';

export default {
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
  components: {
    CardTabsContainer,
  },
  computed: {
    tabConfig: () => ['markdown', 'json'].map(name => ({ name, slot: name })),
  },
};
</script>

