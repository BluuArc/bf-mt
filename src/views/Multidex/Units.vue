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
    <template slot="dialog-toolbar-title" slot-scope="{ viewId, hasViewId, entry }">
      <v-flex class="d-flex" style="overflow-x: auto;">
        <unit-thumbnail
          v-if="hasViewId"
          style="min-width: 32px;"
          :displayWidth="32"
          :displayHeight="32"
          :src="getImageUrls(viewId).ills_battle"
          :rarity="(hasViewId && entry.rarity) || undefined"/>
        <span class="d-align-self-center ml-1">
          <span v-if="hasViewId">
            {{ entry.name }}
          </span>
          <span v-else>
            Units Entry: {{ viewId }}
          </span>
        </span>
      </v-flex>
    </template>
    <template slot="entry-dialog-content" slot-scope="{ viewId, logger }">
      <dialog-content
        :entryId="viewId"
        :logger="logger"
        :pageDb="pageDb"
        :asyncGetById="getById"/>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Units/EntryCard';
import IconEntryCard from '@/components/Multidex/Units/IconEntryCard';
import UnitThumbnail from '@/components/Multidex/Units/UnitThumbnail';
import DialogContent from '@/components/Multidex/Units/DialogContent';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    IconEntryCard,
    UnitThumbnail,
    DialogContent,
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
    ...mapActions('units', ['getById']),
    switchViewMode () {
      const nextViewModeIndex = this.viewModes.indexOf(this.viewMode) + 1;
      this.viewMode = this.viewModes[nextViewModeIndex] || this.viewModes[0];
    },
  },
};
</script>
