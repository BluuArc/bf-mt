<template>
  <v-container fluid class="pa-0 json-viewer">
    <text-viewer v-if="showTextView" :inputText="jsonText" :value="value"/>
    <template v-else>
      <copy-button block :textToCopy="jsonText" :value="value" class="mb-0"/>
      <tree-view v-show="!showTextView" :data="json" :options="treeOptions"/>
    </template>
    <v-btn @click="showTextView = !showTextView" block class="mt-0">Switch View</v-btn>
  </v-container>
</template>

<script>
import TextViewer from '@/components/TextViewer';
import CopyButton from '@/components/CopyButton';
export default {
  props: {
    json: {
      required: true,
    },
    value: {
      default: undefined,
    },
    treeOptions: {
      default: undefined,
    },
  },
  components: {
    TextViewer,
    CopyButton,
  },
  computed: {
    jsonText () {
      return JSON.stringify(this.json, null, 2);
    },
  },
  data () {
    return {
      showTextView: true,
    };
  },
};
</script>

