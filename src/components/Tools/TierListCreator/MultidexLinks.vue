<template>
  <section class="tier-list-multidex-links">
    <v-layout row wrap>
      <v-flex v-if="entryIdSet.length === 0" class="pa-2">
        No entries found.
      </v-flex>
      <v-flex
        v-for="entry in entryIdSet"
        :key="entry"
        xs12 sm6
        class="pa-2"
      >
        <unit-entry-card
          :entry="dataByEntry.get(entry)"
          :to="linkByEntry.get(entry)"
        />
      </v-flex>
    </v-layout>
  </section>
</template>

<script>
import UnitEntryCard from '@/components/Multidex/Units/EntryCard';
// TODO: support other types besides unit?

export default {
  props: {
    entries: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    UnitEntryCard,
  },
  computed: {
    entryIdSet () {
      const units = new Set();
      this.entries.forEach(categoryEntries => {
        categoryEntries.forEach(entry => {
          units.add(entry.id);
        });
      });
      return Array.from(units);
    },
    dataByEntry () {
      const mapping = new Map();
      const getUnit = this.$store.getters['units/getById'];
      this.entryIdSet.forEach(entry => {
        mapping.set(entry, getUnit(entry) || { id: entry });
      });
      return mapping;
    },
    linkByEntry () {
      const mapping = new Map();
      const getUrl = this.$store.getters['units/getMultidexPathTo'];
      this.entryIdSet.forEach(entry => {
        mapping.set(entry, getUrl(entry));
      });
      return mapping;
    },
  },
};
</script>
