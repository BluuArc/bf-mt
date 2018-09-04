<template>
  <div id="filter-chips">
    <element-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
  </div>
</template>

<script>
import ElementChip from './ElementChip';


export default {
  props: {
    // array of strings indicating filter name
    requiredFilters: {
      type: Array,
      default: () => [],
    },
    filterOptions: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    ElementChip,
  },
  methods: {
    applyStylingToChips () {
      // apply consistent styling across all chips
      const chips = Array.from(this.$el.querySelectorAll('.v-chip'));
      chips.forEach(chip => {
        if (!chip.classList.contains('v-chip--small')) {
          chip.classList.add('v-chip--small');
        }
        if (!chip.style.textTransform) {
          chip.style.textTransform = 'capitalize';
        }
      });
    },
  },
  mounted () {
    this.applyStylingToChips();
  },
  watch: {
    requiredFilters () {
      this.applyStylingToChips();
    },
    filterOptions: {
      deep: true,
      handler () {
        this.applyStylingToChips();
      }
    },
  },
};
</script>

<style lang="less">

</style>
