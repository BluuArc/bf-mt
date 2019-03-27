<template>
  <module-checker
    :requiredModules="requiredModules"
    :ensureDbSync="true">
    <v-container fluid>
      <h1>This is the squad page for {{ id }} {{ squad }}</h1>
    </v-container>
  </module-checker>
</template>

<script>
import ModuleChecker from '@/components/ModuleChecker';
import { squadRequiredModules } from '@/router/tool-routes';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  components: {
    ModuleChecker,
  },
  computed: {
    requiredModules: () => squadRequiredModules,
  },
  data () {
    return {
      squad: null,
    };
  },
  mounted () {
    this.$store.dispatch('squads/getSquadById', this.id)
      .then(result => {
        this.squad = result.squad;
      });
  },
};
</script>

<style>

</style>
