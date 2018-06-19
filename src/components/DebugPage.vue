<template>
  <main-page-base
    :required-modules="['units', 'items']"
    :page-db="pageDb"
  ></main-page-base>
</template>

<script>
import { mapState } from 'vuex';
import MainPageBase from '@/components/Multidex/MainPageBase';
export default {
  components: {
    'main-page-base': MainPageBase,
  },
  computed: {
    ...mapState('units', ['pageDb']),
  },
};
</script>
