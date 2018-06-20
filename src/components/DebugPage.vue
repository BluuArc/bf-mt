<template>
  <main-page-base
    :required-modules="['units', 'items']"
    :page-db="pageDb"
    :view-id="viewId"
    :input-server="server"
    :get-multidex-path-to="getMultidexPathTo">
  </main-page-base>
</template>

<script>
import { mapState } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
export default {
  props: ['query', 'viewId', 'server'],
  components: {
    'main-page-base': MainPageBase,
  },
  computed: {
    ...mapState('units', ['pageDb']),
  },
  methods: {
    getMultidexPathTo (id, server = 'gl') {
      return `/debug?viewId=${id}&server=${server}`;
    },
  },
};
</script>
