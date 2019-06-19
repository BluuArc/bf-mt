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
    :onChangeButtonClick="switchViewMode"
    :getCompareName="(id, entry) => (entry && entry.name) || id"
    compareType="item"
  >
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
    <template slot="dialog-toolbar-title" slot-scope="{ viewId, hasViewId, entry }">
      <v-flex class="d-flex" style="overflow-x: auto;">
        <item-thumbnail
          v-if="hasViewId"
          :src="getImageUrl(entry.id)"
          :rarity="(hasViewId && entry.rarity) || undefined"
          :type="(hasViewId && entry.type) || undefined"
          :isRaidItem="hasViewId && !!entry.raid"
          :useFrame="false" :useBackground="false"
          :displayWidth="32" :displayHeight="32"/>
        <span class="d-align-self-center ml-1">
          <span v-if="hasViewId">
            {{ entry.name }}
          </span>
          <span v-else>
            Items Entry: {{ viewId }}
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
    <template slot="compare-input-selection" slot-scope="{ selectionId, selectionName }">
      <v-chip small>
        <v-avatar>
          <img :src="getImageUrl(selectionId, pageDb[selectionId])"/>
        </v-avatar>
        <span v-text="selectionName"/>
      </v-chip>
    </template>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Items/EntryCard';
import IconEntryCard from '@/components/Multidex/Items/IconEntryCard';
import ItemThumbnail from '@/components/Multidex/Items/ItemThumbnail';
import DialogContent from '@/components/Multidex/Items/DialogContent';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    IconEntryCard,
    ItemThumbnail,
    DialogContent,
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
    ...mapActions('items', ['getById']),
    switchViewMode () {
      const nextViewModeIndex = this.viewModes.indexOf(this.viewMode) + 1;
      this.viewMode = this.viewModes[nextViewModeIndex] || this.viewModes[0];
    },
  },
};
</script>
