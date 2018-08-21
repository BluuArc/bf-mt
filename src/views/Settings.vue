<template>
  <v-container grid-list-lg>
    <v-layout row>
      <v-flex>
        <GeneralSettingsCard/>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex>
        <MultidexDataSettingsCard/>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import GeneralSettingsCard from '@/components/Settings/GeneralSettingsCard';
import MultidexDataSettingsCard from '@/components/Settings/MultidexDataSettingsCard';

export default {
  components: {
    GeneralSettingsCard,
    MultidexDataSettingsCard,
  },
};
</script>
