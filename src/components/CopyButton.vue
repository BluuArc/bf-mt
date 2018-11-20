<template>
  <v-btn
    @click="copyToClipboard"
    class="copy-button"
    :block="block"
    :color="dataCopied ? 'green' : undefined">
    {{ currentButtonText }}
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
      const el = document.createElement('textarea');
      el.value = this.textToCopy.slice();
      el.setAttribute('readonly', '');
      el.style.width = '1px';
      el.style.height = '1px';
      el.style.border = 'none';
      el.style.zIndex = -1;
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.dataCopied = true;
    },
  },
}
</script>

