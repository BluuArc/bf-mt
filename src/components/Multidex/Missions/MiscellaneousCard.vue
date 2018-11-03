<template>
  <bordered-titled-card materialColor="light-green darken-2" class="multidex-dialog-content-card">
    <span slot="title">Miscellaneous Info</span>
    <v-container fluid>
      <v-layout row wrap class="d-align-items-center">
        <v-flex xs12 sm6 md4 v-for="(entry, i) in miscellaneousItems" :key="i">
          <v-layout row class="d-align-items-center">
            <v-flex xs6 class="text-xs-center pl-0 pr-0">
              <b>{{ entry.label }}</b>
            </v-flex>
            <v-flex xs6 class="text-xs-center pl-0 pr-0">
              {{ entry.value }}
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </bordered-titled-card>
</template>

<script>
import BorderedTitledCard from '@/components/BorderedTitledCard';

export default {
  props: {
    mission: {
      type: Object,
    },
    logger: {
      required: true,
    },
  },
  components: {
    BorderedTitledCard,
  },
  computed: {
    miscellaneousItems () {
      return !this.mission ? [] : [
        { label: 'Mission ID:', value: this.mission.id },
        { label: 'Energy Cost:', value: this.mission.energy_use },
        { label: 'Battle Count:', value: this.mission.battle_count },
        { label: 'XP/Energy:', value: this.xpPerEnergy },
        { label: 'Continues Allowed?', value: (this.mission.continue ? 'Yes' : 'No') },
      ];
    },
    xpPerEnergy () {
      if (!this.mission) {
        return 0;
      }
      const result = (+this.mission.xp / (Math.max(1, +this.mission.energy_use))).toFixed(2);
      const [whole, dec] = result.split('.');
      return (+dec === 0) ? whole : result;
    },
  },
};
</script>
