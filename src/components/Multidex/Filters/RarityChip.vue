<template>
  <v-chip v-show="showChip">
    <span v-if="rarityArr.length === 0">
      No Rarity
    </span>
    <span v-else-if="rarityArr.length === 1" class="d-flex d-align-self-center">
      <b v-if="rarityArr[0] < 8" v-text="rarityArr[0]"/>
      <rarity-icon class="ml-1 mr-1" :rarity="rarityArr[0]" :display-size="18"/>
      Only
    </span>
    <span v-else>
      {{ rarityArr.length }} Different Rarities
    </span>
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';
import RarityIcon from '@/components/Multidex/RarityIcon';

export default {
  mixins: [ChipMixin],
  props: {
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
    RarityIcon,
  },
  computed: {
    showChip () {
      return this.requiredFilters.includes('rarity') &&
        this.rarityArr.length < this.defaultRarityRange.length;
    },
    rarityArr () {
      return this.filterOptions.rarity || [];
    },
    defaultRarityRange () {
      return Object.keys(new Array(this.maxRarity - this.minRarity + 1).fill(0)).map(i => +i + this.minRarity);
    },
  },
};
</script>
