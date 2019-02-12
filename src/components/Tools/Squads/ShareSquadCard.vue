<template>
  <v-card>
    <card-tabs-container :tabs="tabConfig">
      <v-layout row slot="markdown">
        markdown {{ squad.name }}
      </v-layout>
      <v-layout row slot="json">
        <json-viewer :json="copyableJson" :value="activeTabIndex"/>
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
import TextViewer from '@/components/TextViewer';
import JsonViewer from '@/components/JsonViewer';

export default {
  props: {
    squad: {
      type: Object,
      required: true,
    },
  },
  components: {
    CardTabsContainer,
    TextViewer,
    JsonViewer,
  },
  computed: {
    tabConfig: () => ['markdown', 'json'].map(name => ({ name, slot: name })),
    copyableJson () {
      // don't need to share ID to export
      // eslint-disable-next-line no-unused-vars
      const { id, ...data } = this.squad;
      return data;
    },
  },
  data () {
    return {
      activeTabIndex: 0,
    };
  },
};
</script>

