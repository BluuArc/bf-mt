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
    :isUnit="true">
    <v-layout row wrap slot="results" slot-scope="{ keys, getMultidexPathTo }">
      <v-flex
        v-for="key in keys"
        :key="key"
        xs12 sm6 md4>
        <entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
      </v-flex>
    </v-layout>
  </main-page-base>
</template>

<script>
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Units/EntryCard';
import { mapState, mapGetters } from 'vuex';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls', 'getMultidexRouteParamsTo', 'sortTypes']),
    requiredModules: () => ['units', 'items', 'missions'],
    filterTypes: () => ['elements', 'rarity', 'unitKinds', 'genders', 'exclusives', 'procs', 'passives'],
  },
};
</script>
