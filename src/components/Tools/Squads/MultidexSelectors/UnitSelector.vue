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
          style="background: var(--background-color); cursor: pointer;"
          @click.native="sendEntry(entry)"
          :entry="pageDb[entry]"/>
      </v-flex>
    </v-layout>
  </base-selector>
</template>

<script>
import BaseSelector from '@/components/Tools/Squads/MultidexSelectors/BaseSelector';
import EntryCard from '@/components/Multidex/Units/EntryCard';
import { makeMultidexTableInstance } from '@/modules/BfmtDatabase/client';

const dbClient = makeMultidexTableInstance('units');
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
      return ['units'];
    },
    pageDb () {
      return this.$store.state.units.pageDb;
    },
    allIds () {
      const allKeys = Object.keys(this.pageDb);
      return !this.nameFilter
        ? allKeys
        : allKeys.filter(k => this.hasName(this.pageDb[k].name, this.nameFilter));
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
      this.$emit('input', {
        id,
        data: dbClient.getById({
          server: this.$store.state.settings.activeServer,
          id,
        }).catch(() => ({})),
      });
    },
  },
};
</script>
