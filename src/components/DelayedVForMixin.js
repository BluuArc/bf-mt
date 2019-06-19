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
            this.$emit('progress', Math.floor(this.internalEntries.length / entries.length * 100));

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
