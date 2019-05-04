<template>
  <component :is="containerComponent">
    <div v-for="(entry, i) in internalEntries" :key="i" v-bind="generateWrapperAttributes(entry, i)">
      <slot name="default" :entry="entry">
        <div>{{ entry }}</div>
      </slot>
    </div>
  </component>
</template>

<script>
export default {
  props: {
    entries: {
      type: Array,
      default: () => [],
    },
    tickFunction: {
      required: false,
    },
    amountToAddPerTick: {
      type: Number,
      default: 1,
    },
    getKeyFunction: {
      type: Function,
      default: (entry, index) => `${JSON.stringify(entry)}-${index}`,
    },
    containerComponent: {
      default: () => ({
        functional: true,
        render (createElement, context) {
          return createElement('div', context.data, context.children);
        },
      }),
    },
    generateWrapperAttributes: {
      type: Function,
      default: () => {},
    },
  },
  data () {
    return {
      currentLoop: null,
      entriesModifiedTime: 0,
      internalEntries: [],
      currentIndex: 0,
    };
  },
  methods: {
    defaultTickFunction () {
      return new Promise((fulfill) => {
        requestAnimationFrame(() => fulfill());
      });
    },
    startIteration () {
      this.currentLoop = Promise.resolve(this.currentLoop)
        .then(async () => {
          const currentToken = this.entriesModifiedTime;
          const { amountToAddPerTick, entries } = this;
          const tickFunction = typeof this.tickFunction === 'function' ? this.tickFunction : this.defaultTickFunction;
          this.internalEntries = [];

          let currentLoop = 0;
          const numLoops = Math.ceil(entries.length / amountToAddPerTick);
          while (currentLoop < numLoops && currentToken === this.entriesModifiedTime) {
            await Promise.resolve(tickFunction());

            const startIndex = currentLoop * amountToAddPerTick;
            const subsetToAdd = entries.slice(startIndex, startIndex + amountToAddPerTick);
            this.internalEntries.push(...subsetToAdd);

            ++currentLoop;
          }
        });
    },
  },
  watch: {
    entries: {
      immediate: true,
      handler () {
        this.entriesModifiedTime = Date.now();
        this.startIteration();
      },
    },
  },
};
</script>

<style>

</style>
