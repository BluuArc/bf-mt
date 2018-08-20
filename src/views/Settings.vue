<template>
  <v-container grid-list-lg>
    <v-layout row>
      <v-flex>
        <GeneralSettingsCard/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GeneralSettingsCard from '@/components/Settings/GeneralSettingsCard';

export default {
  components: {
    GeneralSettingsCard,
  },
};
</script>
