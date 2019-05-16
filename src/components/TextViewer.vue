<template>
  <v-container fluid :class="{ 'text-viewer pa-0': true, 'limit-height': limitHeight }">
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
    limitHeight: {
      type: Boolean,
      default: true,
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
  display: flex;
  flex-direction: column;

  .copy-button {
    flex: none;
  }

  &.limit-height pre {
    max-height: 45vh;
  }

  pre {
    overflow: auto;
    flex: auto;
  }

  code {
    width: 100%;
    height: 100%;

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

