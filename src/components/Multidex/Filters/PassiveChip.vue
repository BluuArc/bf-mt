<template>
  <v-chip v-show="showChip">
    {{ message }}
  </v-chip>
</template>

<script>
import ChipMixin from './FilterChipMixin';

export default {
  mixins: [ChipMixin],
  props: {
    isUnit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    showChip () {
      return this.requiredFilters.includes('passives') &&
        this.passivesArr.length > 0;
    },
    passivesArr () {
      return this.filterOptions.passives || [];
    },
    passiveAreas () {
      return this.filterOptions.passiveBuffSearchOptions || [];
    },
    message () {
      const countMessage = this.passivesArr.length === 1
        ? `Passive [${this.passivesArr[0]}]`
        : `${this.passivesArr.length} Passives`;

      if (this.isUnit) {
        const areaMessage = `on ${this.passiveAreas.map(val => val.toUpperCase()).join('/') || 'Nothing'}`;
        return [countMessage, areaMessage].join(' ');
      } else {
        return countMessage;
      }
    },
  },
};
</script>
