<template>
  <div id="json-viewer">
    <button
      id="json-button"
      @click="copyToClipboard"
      class="ui button fluid top attached">
      {{ copyButtonText }}
    </button>
    <textarea
      id="json-text-area"
      readonly
      v-model="jsonData"></textarea>
    <pre class="ui bottom attached">
      <code>{{ jsonData }}</code>
    </pre>
  </div>
</template>

<script>
/* global $ */
export default {
  props: ['json'],
  computed: {
    jsonData() {
      return JSON.stringify(this.json, null, 2);
    },
    defaultCopyText() {
      return 'Click to Copy';
    },
  },
  watch: {
    json() {
      this.copyButtonText = this.defaultCopyText;
    },
  },
  data() {
    return {
      copyButtonText: 'Click to Copy',
    };
  },
  methods: {
    copyToClipboard() {
      const textarea = $(this.$el).find('textarea').get(0);
      textarea.select();
      document.execCommand('Copy');
      textarea.selectionEnd = 0;
      this.copyButtonText = 'Copied text!';
    },
  },
};
</script>

<style>
#json-viewer {
  position: relative;
}

#json-viewer pre {
  overflow: auto;
  max-height: 45vh;
}

#json-viewer textarea#json-text-area {
  width: 0;
  height: 0;
  border: none;
  position: absolute;
  z-index: -1;
}

#json-viewer button#json-button:active {
  animation-name: buttonanimation;
  animation-duration: 0.25s;
  animation-iteration-count: 1;
}

@keyframes buttonanimation {
  /* semantic button green */
  from { background-color: #21BA45; }

  /* semantic button default */
  to { background-color: #E0E1E2; }
}
</style>
