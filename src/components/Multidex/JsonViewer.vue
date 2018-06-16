<template>
  <text-viewer :input-text="jsonText" :change-view="changeView"/>
</template>

<script>
import TextViewer from '@/components/Multidex/TextViewer';
export default {
  props: ['json', 'changeView'],
  components: {
    'text-viewer': TextViewer,
  },
  computed: {
    jsonText () {
      return JSON.stringify(this.json, null, 2);
    },
  },
};
</script>
