<template>
  <main-page-base
    :requiredModules="requiredModules"
    :sortTypes="sortTypes"
    :getMultidexRouteParamsTo="getMultidexRouteParamsTo"
    :inputServer="server"
    :viewId="viewId"
    :pageDb="pageDb"
    :inputFilters="filters"
    :filterTypes="filterTypes">
    <v-layout row wrap slot="results" slot-scope="{ keys, getMultidexPathTo }">
      <v-flex
        v-for="key in keys"
        :key="key"
        xs12 sm6 md4 xl3>
        <entry-card :to="getMultidexPathTo(key)" :entry="pageDb[key]" v-if="pageDb.hasOwnProperty(key)"/>
      </v-flex>
    </v-layout>
    <!-- <template slot="dialog-toolbar-title" slot-scope="{ viewId, hasViewId, entry }">
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
    </template> -->
  </main-page-base>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Bursts/EntryCard';
// import DialogContent from '@/components/Multidex/Items/DialogContent';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
    // DialogContent,
  },
  computed: {
    ...mapState('bursts', ['pageDb']),
    ...mapGetters('bursts', ['getMultidexRouteParamsTo', 'sortTypes', 'requiredModules', 'filterTypes']),
  },
  methods: {
    ...mapActions('bursts', ['getById']),
  },
};
</script>
