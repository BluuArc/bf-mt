<template>
  <div>
    <v-text-field :value="inputText" :label="label" readonly/>
    <copy-button block :textToCopy="inputText" :value="value" class="mb-0"/>
  </div>
</template>

<script>
import CopyButton from '@/components/CopyButton';
export default {
  props: {
    inputText: {
      type: String,
      default: '',
    },
    label: {
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
