<template>
  <base-selector
    :showCancelButton="showCancelButton"
    :value="nameFilter"
    :hasSelection="hasSelection"
    @input="$i => nameFilter = ($i || '').toLowerCase()"
    @cancel="$emit('cancel')"
    :requiredModules="requiredModules"
    :allEntryIds="allIds">
    <v-layout row wrap slot="entries" slot-scope="{ entries }">
      <v-flex
        v-for="entry in entries"
        :key="entry"
        xs12 sm6 md4 xl3>
        <entry-card
          class="ma-2"
          style="background: var(--background-color); cursor: pointer; height: auto;"
          @click.native="sendEntry(entry)"
          :entry="pageDb[entry]"/>
      </v-flex>
    </v-layout>
  </base-selector>
</template>

<script>
import BaseSelector from '@/components/Tools/Squads/MultidexSelectors/BaseSelector';
import EntryCard from '@/components/Multidex/ExtraSkills/EntryCard';

export default {
  props: {
    showCancelButton: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    BaseSelector,
    EntryCard,
  },
  computed: {
    requiredModules () {
      return ['extraSkills', 'units'];
    },
    pageDb () {
      return this.$store.state.extraSkills.pageDb;
    },
    allIds () {
      return Object.keys(this.pageDb).filter(k => {
        const hasAssociatedUnits = !!this.pageDb[k].associated_units;
        const hasName = !this.nameFilter || this.hasName(this.pageDb[k].name, this.nameFilter);
        return !hasAssociatedUnits && hasName;
      });
    },
  },
  data () {
    return {
      nameFilter: '',
      hasSelection: false,
    };
  },
  methods: {
    hasName (name = '', query = '') {
      return name.toLowerCase().includes(query);
    },
    sendEntry (id) {
      this.hasSelection = true;
      this.$emit('input', { id });
    },
  },
};
</script>

