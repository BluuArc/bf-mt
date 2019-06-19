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
    <v-layout row wrap slot="results" slot-scope="{ keys, logger }">
      <v-flex
        v-for="key in keys"
        :key="key"
        xs12 sm6 md4 xl3>
        <entry-card
          class="no-highlight"
          v-if="pageDb.hasOwnProperty(key)"
          @click.native="logger.debug({ key, value: pageDb[key] })"
          :entry="pageDb[key]"
          :entryKey="key"/>
      </v-flex>
    </v-layout>
  </main-page-base>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';
import EntryCard from '@/components/Multidex/Dictionary/EntryCard';

export default {
  mixins: [MultidexPageMixin],
  components: {
    EntryCard,
  },
  computed: {
    ...mapState('dictionary', ['pageDb']),
    ...mapGetters('dictionary', ['getMultidexRouteParamsTo', 'sortTypes', 'requiredModules', 'filterTypes']),
    ...mapState('units', {
      unitDb: 'pageDb',
    }),
    ...mapState('items', {
      itemDb: 'pageDb',
    }),
  },
  methods: {
    ...mapMutations('dictionary', ['setLoadState']),
    ...mapActions('dictionary', ['getById', 'updateAssociations']),
    onInitDb () {
      // NOTE: disabled for the time being (add function as param in main-page-base to re-enable)
      return this.updateAssociations({
        unitDb: this.unitDb,
        itemDb: this.itemDb,
        setLoadState: true,
      });
    },
  },
};
</script>
