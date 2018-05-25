<template>
  <div class="json-viewer">
    <v-btn @click="copyToClipboard" block :color="copyButtonText !== defaultCopyText ? 'green' : undefined">
      {{ copyButtonText }}
    </v-btn>
    <textarea readonly v-model="jsonText"/>
    <pre><code>{{ jsonText }}</code></pre>
  </div>
</template>

<script>
export default {
  props: ['json', 'changeView'],
  computed: {
    jsonText () {
      return JSON.stringify(this.json, null, 2);
    },
    defaultCopyText () {
      return 'Copy to Clipboard';
    },
  },
  watch: {
    json () {
      this.resetCopyText();
    },
    changeView () {
      this.resetCopyText();
    },
  },
  data () {
    return {
      copyButtonText: 'Copy to Clipboard',
    };
  },
  mounted () {
    this.resetCopyText();
  },
  methods: {
    resetCopyText () {
      this.copyButtonText = this.defaultCopyText;
    },
    copyToClipboard () {
      const textarea = this.$el.getElementsByTagName('textarea')[0];
      textarea.select();
      document.execCommand('Copy');
      textarea.selectionEnd = 0;
      this.copyButtonText = 'Copied text!';
    },
  },
};
</script>

<style>
.json-viewer {
  position: relative;
}

.json-viewer pre {
  overflow: auto;
  max-height: 45vh;
}

.json-viewer code {
  width: 100%;
}

.json-viewer textarea {
  width: 1px;
  height: 1px;
  border: none;
  position: absolute;
  z-index: -1;
}
</style>
