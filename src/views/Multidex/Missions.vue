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
      <template v-if="viewMode === 'normal'">
        <v-flex
          v-for="key in keys"
          :key="key"
          xs12 sm6 md4 xl3>
          <entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
        </v-flex>
      </template>
      <template v-if="viewMode === 'flavor_text'">
        <v-flex
          v-for="key in keys"
          :key="key"
          xs12 sm6 md4 xl3>
          <descriptive-entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
        </v-flex>
      </template>
    </v-layout>
    <template slot="dialog-toolbar-title" slot-scope="{ viewId, hasViewId, entry }">
        <span v-if="hasViewId">
          {{ entry.name }}
        </span>
        <span v-else>
          Mission Entry: {{ viewId }}
        </span>
    </template>
    <!-- <template slot="entry-dialog-content" slot-scope="{ viewId, logger }">
      <dialog-content
        :entryId="viewId"
        :logger="logger"
        :pageDb="pageDb"
        :asyncGetById="getById"/>
    </template> -->
  </main-page-base>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Missions/EntryCard';
import DescriptiveEntryCard from '@/components/Multidex/Missions/DescriptiveEntryCard';
// import DialogContent from '@/components/Multidex/Missions/DialogContent';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    DescriptiveEntryCard,
    // DialogContent,
  },
  computed: {
    ...mapState('missions', ['pageDb']),
    ...mapGetters('missions', ['getMultidexRouteParamsTo', 'sortTypes', 'requiredModules', 'filterTypes']),
    viewModes: () => ['normal', 'flavor_text'],
  },
  data: () => ({
    viewMode: 'normal',
  }),
  methods: {
    ...mapActions('missions', ['getById']),
    switchViewMode () {
      const nextViewModeIndex = this.viewModes.indexOf(this.viewMode) + 1;
      this.viewMode = this.viewModes[nextViewModeIndex] || this.viewModes[0];
    },
  },
};
</script>
