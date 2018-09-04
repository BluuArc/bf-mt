<template>
  <div id="filter-chips">
    <element-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <rarity-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions" :minRarity="minRarity" :maxRarity="maxRarity"/>
  </div>
</template>

<script>
import ElementChip from './ElementChip';
import RarityChip from './RarityChip';

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
    minRarity: {
      type: Number,
      default: 0,
    },
    maxRarity: {
      type: Number,
      default: 8,
    },
  },
  components: {
    ElementChip,
    RarityChip,
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
