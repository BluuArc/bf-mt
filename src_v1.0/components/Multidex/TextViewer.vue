<template>
  <v-container fluid class="text-viewer pa-0">
    <v-btn @click="copyToClipboard" block :color="copyButtonText !== defaultCopyText ? 'green' : undefined">
      {{ copyButtonText }}
    </v-btn>
    <textarea readonly v-model="inputText"/>
    <pre><code>{{ inputText }}</code></pre>
  </v-container>
</template>

<script>
export default {
  props: ['inputText', 'changeView'],
  computed: {
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
.text-viewer {
  position: relative;
}

.text-viewer pre {
  overflow: auto;
  max-height: 45vh;
}

.text-viewer code {
  width: 100%;
}

.text-viewer code::before {
  content: '';
}

.text-viewer textarea {
  width: 1px;
  height: 1px;
  border: none;
  position: absolute;
  z-index: -1;
}
</style>
