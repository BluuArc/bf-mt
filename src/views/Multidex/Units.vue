<template>
  <main-page-base
    :requiredModules="requiredModules"
    :sortTypes="sortTypes"
    :getMultidexRouteParamsTo="getMultidexRouteParamsTo"
    :inputServer="server"
    :viewId="viewId"
    :pageDb="pageDb"
    :inputFilters="filters"
    :filterTypes="filterTypes"
    :minRarity="1"
    :isUnit="true"
    :onChangeButtonClick="switchViewMode">
    <v-layout row wrap slot="results" slot-scope="{ keys, getMultidexPathTo }">
      <template v-if="viewMode === 'card'">
        <v-flex
          v-for="key in keys"
          :key="key"
          xs12 sm6 md4 xl3>
          <entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
        </v-flex>
      </template>
      <template v-else>
        <v-flex
          v-for="key in keys"
          :key="key"
          lg1 sm2 xs3>
          <icon-entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
        </v-flex>
      </template>
    </v-layout>
  </main-page-base>
</template>

<script>
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Units/EntryCard';
import IconEntryCard from '@/components/Multidex/Units/IconEntryCard';
import { mapState, mapGetters } from 'vuex';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    IconEntryCard,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls', 'getMultidexRouteParamsTo', 'sortTypes']),
    requiredModules: () => ['units', 'items', 'missions'],
    filterTypes: () => ['elements', 'rarity', 'unitKinds', 'genders', 'exclusives', 'procs', 'passives'],
    viewModes: () => ['card', 'icon'],
  },
  data () {
    return {
      viewMode: 'card',
    };
  },
  methods: {
    switchViewMode () {
      const nextViewModeIndex = this.viewModes.indexOf(this.viewMode) + 1;
      return this.viewModes[nextViewModeIndex] || this.viewModes[0];
    },
  },
};
</script>
