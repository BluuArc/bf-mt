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

  </main-page-base>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MultidexPageMixin from '@/components/Multidex/MultidexPageMixin';

export default {
  mixins: [MultidexPageMixin],
  computed: {
    ...mapState('items', ['pageDb']),
    ...mapGetters('items', ['getImageUrl', 'getMultidexRouteParamsTo', 'sortTypes', 'requiredModules', 'filterTypes']),
    viewModes: () => ['card', 'icon'],
  },
};
</script>
