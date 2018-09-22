<template>
  <div id="filter-chips">
    <element-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <rarity-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions" :minRarity="minRarity" :maxRarity="maxRarity"/>
    <unit-kind-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <gender-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <item-type-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <sphere-type-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <craftables-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <usage-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <associated-units-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <server-exclusive-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions"/>
    <proc-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions" :isUnit="isUnit"/>
    <passive-chip :requiredFilters="requiredFilters" :filterOptions="filterOptions" :isUnit="isUnit"/>
  </div>
</template>

<script>
import ElementChip from './ElementChip';
import RarityChip from './RarityChip';
import UnitKindChip from './UnitKindChip';
import GenderChip from './GenderChip';
import ItemTypeChip from './ItemTypeChip';
import SphereTypeChip from './SphereTypeChip';
import CraftablesChip from './CraftablesChip';
import UsageChip from './UsageChip';
import AssociatedUnitsChip from './AssociatedUnitsChip';
import ServerExclusiveChip from './ServerExclusiveChip';
import ProcChip from './ProcChip';
import PassiveChip from './PassiveChip';

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
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ElementChip,
    RarityChip,
    UnitKindChip,
    GenderChip,
    ItemTypeChip,
    SphereTypeChip,
    CraftablesChip,
    UsageChip,
    AssociatedUnitsChip,
    ServerExclusiveChip,
    ProcChip,
    PassiveChip,
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
