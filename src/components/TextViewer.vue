<template>
  <v-container fluid class="text-viewer pa-0">
    <copy-button block :textToCopy="inputText" :value="value" class="mb-0"/>
    <pre><code>{{ inputText }}</code></pre>
  </v-container>
</template>

<script>
import CopyButton from '@/components/CopyButton';
export default {
  props: {
    inputText: {
      type: String,
      default: '',
    },
    // resets button text on change
    value: {
      default: undefined,
    },
  },
  components: {
    CopyButton,
  },
};
</script>

<style lang="less">
.text-viewer {
  position: relative;

  pre {
    overflow: auto;
    max-height: 45vh;
  }

  code {
    width: 100%;

    &::before {
      content: '';
    }

    .theme--dark & {
      border: 1px solid var(--background-color);
      background-color: black;
      color: lightgreen;
    }
  }
}
</style>

