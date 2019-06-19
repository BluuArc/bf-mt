<template>
  <v-btn
    v-bind="$attrs"
    @click="copyToClipboard"
    class="copy-button"
    :block="block"
    :color="dataCopied ? 'green' : undefined">
    {{ currentButtonText }}
    <textarea readonly v-model="textToCopy"/>
  </v-btn>
</template>

<script>
export default {
  props: {
    textToCopy: {
      type: String,
      default: '',
    },
    // resets button text on change
    value: {
      default: undefined,
    },
    buttonText: {
      type: String,
      default: 'Copy to Clipboard',
    },
    buttonTextCopied: {
      type: String,
      default: 'Copied text!',
    },
    block: {
      required: false,
    },
  },
  computed: {
    currentButtonText () {
      return this.dataCopied ? this.buttonTextCopied : this.buttonText;
    },
  },
  data () {
    return {
      dataCopied: false,
    };
  },
  watch: {
    value () {
      this.dataCopied = false;
    },
  },
  methods: {
    copyToClipboard () {
      const textarea = this.$el.querySelector('textarea');
      textarea.select();
      document.execCommand('Copy');
      textarea.selectionEnd = 0;
      this.dataCopied = true;
    },
  },
};
</script>

<style scoped>
textarea {
  width: 1px;
  height: 1px;
  border: none;
  position: absolute;
  z-index: -1;
  left: -9999px;
}
</style>
