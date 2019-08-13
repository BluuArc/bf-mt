<template>
  <g v-bind="$attrs">
    <text
      v-for="(line, i) in lines"
      :key="`${line}-${i}`"
      v-bind="getTextAttributes(i)"
      v-text="line"
    />
  </g>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: '',
    },
    textAttributes: {
      type: Object,
      default: () => {},
    },
    containerHeight: {
      type: Number,
      default: 100,
    },
  },
  computed: {
    lines () {
      return this.text.split('\n');
    },
    fontSize () {
      const { textAttributes = {} } = this;
      return !isNaN(textAttributes.fontSize)
        ? +textAttributes.fontSize
        : 16;
    },
  },
  methods: {
    getTextAttributes (index) {
      const { textAttributes = {}, fontSize } = this;
      return {
        ...textAttributes,
        y: (textAttributes.y || 0) + (index * fontSize),
      };
    },
    centerText () {
      const group = this.$el;
      const groupHeight = group.getBBox().height;
      const yOffset = this.containerHeight > groupHeight
        ? (this.containerHeight - groupHeight) / 2
        : 0;
      group.setAttribute('transform', `translate(0,${yOffset})`);
    },
  },
  async mounted () {
    await new Promise(fulfill => setTimeout(fulfill, 50));
    this.centerText();
  },
  watch: {
    async text () {
      this.$el.setAttribute('transform', '');
      await new Promise(fulfill => setTimeout(fulfill, 50));
      this.centerText();
    },
  },
};
</script>

