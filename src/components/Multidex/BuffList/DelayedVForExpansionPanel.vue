<template>
  <v-expansion-panel v-bind="$attrs" :value="value" @input="$v => $emit('input', $v)">
    <v-expansion-panel-content v-for="(entry, i) in internalEntries" :key="getKeyFunction(entry, i)">
      <template slot="header">
        <slot name="header" :arrayEntry="entry" :index="i">
          Header
        </slot>
      </template>
      <slot name="default" :arrayEntry="entry" :index="i">
        <div>{{ entry }}</div>
      </slot>
    </v-expansion-panel-content>
  </v-expansion-panel>
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
    value: {
      required: false,
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
          this.$emit('start', currentToken);
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

          if (currentToken === this.entriesModifiedTime && this.internalEntries.length === this.entries.length) {
            this.$emit('end', currentToken);
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
