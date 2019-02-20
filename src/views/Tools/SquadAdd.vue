<template>
  <module-checker
    :requiredModules="requiredModules"
    externalLoadingMessage="Fetching squad information...">
    <v-container>
      You are adding a squad. Import: {{ importSquad }}
    </v-container>
  </module-checker>
</template>

<script>
import ModuleChecker from '@/components/ModuleChecker';
import { squadRequiredModules } from '@/router/tool-routes';

export default {
  props: {
    importSquad: {
      type: String,
      default: '',
    },
  },
  components: {
    ModuleChecker,
  },
  computed: {
    requiredModules: () => squadRequiredModules,
  },
};
</script>
