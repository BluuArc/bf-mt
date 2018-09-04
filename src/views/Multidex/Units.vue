<template>
  <main-page-base
    :requiredModules="requiredModules"
    :sortTypes="sortTypes"
    :getMultidexPathTo="getMultidexPathTo"
    :inputServer="server"
    :viewId="viewId"
    :pageDb="pageDb"
    :inputFilters="filters"
  >
  </main-page-base>
</template>

<script>
import MainPageBase from '@/components/Multidex/MainPageBase';
import { mapState, mapGetters } from 'vuex';

export default {
  props: ['query', 'viewId', 'server', 'filters'],
  components: {
    MainPageBase,
  },
  computed: {
    ...mapState('units', ['pageDb']),
    ...mapGetters('units', ['getImageUrls', 'getMultidexPathTo', 'sortTypes']),
    requiredModules: () => ['units', 'items', 'missions'],
  },
};
</script>
