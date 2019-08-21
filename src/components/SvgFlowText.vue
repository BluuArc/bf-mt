<template>
  <text v-bind="$attrs"/>
</template>

<script>
import { textFlow } from '@/modules/TextFlow';

export default {
  props: {
    flowText: {
      type: String,
      required: true,
    },
    flowMaxWidth: {
      type: Number,
      required: true,
    },
    flowX: {
      type: Number,
      default: 0,
    },
    flowLineHeight: {
      type: Number,
      required: true,
    },
    flowJustified: {
      type: Boolean,
      default: false,
    },
  },
  mounted () {
    this.runTextFlow();
  },
  methods: {
    runTextFlow () {
      this.$el.innerHTML = ''; // clear old text on re-run
      const height = textFlow(this.flowText, this.$el, this.flowMaxWidth, this.flowX, this.flowLineHeight, this.flowJustified);
      this.$emit('height', height);
    },
  },
  watch: {
    flowText () {
      this.runTextFlow();
    },
    flowMaxWidth () {
      this.runTextFlow();
    },
    flowX () {
      this.runTextFlow();
    },
    flowLineHeight () {
      this.runTextFlow();
    },
    flowJustified () {
      this.runTextFlow();
    },
  },
};
</script>
