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
          xl1 md2 sm3 xs6>
          <icon-entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
        </v-flex>
      </template>
    </v-layout>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Items/EntryCard';
import IconEntryCard from '@/components/Multidex/Items/IconEntryCard';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    IconEntryCard,
  },
  computed: {
    ...mapState('items', ['pageDb']),
    ...mapGetters('items', ['getImageUrl', 'getMultidexRouteParamsTo', 'sortTypes', 'requiredModules', 'filterTypes']),
    viewModes: () => ['card', 'icon'],
  },
  data: () => ({
    viewMode: 'card',
  }),
  methods: {
    switchViewMode () {
      const nextViewModeIndex = this.viewModes.indexOf(this.viewMode) + 1;
      this.viewMode = this.viewModes[nextViewModeIndex] || this.viewModes[0];
    },
  },
};
</script>
